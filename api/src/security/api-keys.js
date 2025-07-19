import { env } from "../config.js";
import { Green, Yellow } from "../misc/console-text.js";
import ip from "ipaddr.js";
import * as cluster from "../misc/cluster.js";
import { FileWatcher } from "../misc/file-watcher.js";

// this function is a modified variation of code
// from https://stackoverflow.com/a/32402438/14855621
const generateWildcardRegex = rule => {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$");
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let keys = {}, reader = null;

const ALLOWED_KEYS = new Set(['name', 'ips', 'userAgents', 'limit', 'allowedServices']);

/* Expected format pseudotype:
** type KeyFileContents = Record<
**    UUIDv4String,
**    {
**        name?: string,
**        limit?: number | "unlimited",
**        ips?: CIDRString[],
**        userAgents?: string[],
**        allowedServices?: "all" | string[],
**    }
** >;
*/

const validateKeys = (input) => {
    if (typeof input !== 'object' || input === null) {
        throw "input is not an object";
    }

    if (Object.keys(input).some(x => !UUID_REGEX.test(x))) {
        throw "key file contains invalid key(s)";
    }

    Object.values(input).forEach(details => {
        if (typeof details !== 'object' || details === null) {
            throw "some key(s) are incorrectly configured";
        }

        const unexpected_key = Object.keys(details).find(k => !ALLOWED_KEYS.has(k));
        if (unexpected_key) {
            throw "detail object contains unexpected key: " + unexpected_key;
        }

        if (details.limit && details.limit !== 'unlimited') {
            if (typeof details.limit !== 'number')
                throw "detail object contains invalid limit (not a number)";
            else if (details.limit < 1)
                throw "detail object contains invalid limit (not a positive number)";
        }

        if (details.ips) {
            if (!Array.isArray(details.ips))
                throw "details object contains value for `ips` which is not an array";

            const invalid_ip = details.ips.find(
                addr => typeof addr !== 'string' || (!ip.isValidCIDR(addr) && !ip.isValid(addr))
            );

            if (invalid_ip) {
                throw "`ips` in details contains an invalid IP or CIDR range: " + invalid_ip;
            }
        }

        if (details.userAgents) {
            if (!Array.isArray(details.userAgents))
                throw "details object contains value for `userAgents` which is not an array";

            const invalid_ua = details.userAgents.find(ua => typeof ua !== 'string');
            if (invalid_ua) {
                throw "`userAgents` in details contains an invalid user agent: " + invalid_ua;
            }
        }

        if (details.allowedServices) {
            if (Array.isArray(details.allowedServices)) {
                const invalid_services = details.allowedServices.some(
                    service => !env.allServices.has(service)
                );
                if (invalid_services) {
                    throw "`allowedServices` in details contains an invalid service";
                }
            } else if (details.allowedServices !== "all") {
                throw "details object contains value for `allowedServices` which is not an array or `all`";
            }
        }
    });
}

const formatKeys = (keyData) => {
    const formatted = {};

    for (let key in keyData) {
        const data = keyData[key];
        key = key.toLowerCase();

        formatted[key] = {};

        if (data.limit) {
            if (data.limit === "unlimited") {
                data.limit = Infinity;
            }

            formatted[key].limit = data.limit;
        }

        if (data.ips) {
            formatted[key].ips = data.ips.map(addr => {
                if (ip.isValid(addr)) {
                    const parsed = ip.parse(addr);
                    const range = parsed.kind() === 'ipv6' ? 128 : 32;
                    return [ parsed, range ];
                }

                return ip.parseCIDR(addr);
            });
        }

        if (data.userAgents) {
            formatted[key].userAgents = data.userAgents.map(generateWildcardRegex);
        }

        if (data.allowedServices) {
            if (Array.isArray(data.allowedServices)) {
                formatted[key].allowedServices = new Set(data.allowedServices);
            } else {
                formatted[key].allowedServices = data.allowedServices;
            }
        }
    }

    return formatted;
}

const updateKeys = (newKeys) => {
    validateKeys(newKeys);

    cluster.broadcast({ api_keys: newKeys });

    keys = formatKeys(newKeys);
}

const loadRemoteKeys = async (source) => {
    updateKeys(
        await fetch(source).then(a => a.json())
    );
}

const loadLocalKeys = async () => {
    updateKeys(
        JSON.parse(await reader.read())
    );
}

const wrapLoad = (url, initial = false) => {
    let load = loadRemoteKeys.bind(null, url);

    if (url.protocol === 'file:') {
        if (initial) {
            reader = FileWatcher.fromFileProtocol(url);
            reader.on('file-updated', () => wrapLoad(url));
        }

        load = loadLocalKeys;
    }

    load().then(() => {
        if (initial || reader) {
            console.log(`${Green('[✓]')} api keys loaded successfully!`)
        }
    })
    .catch((e) => {
        console.error(`${Yellow('[!]')} Failed loading API keys at ${new Date().toISOString()}.`);
        console.error('Error:', e);
    })
}

const err = (reason) => ({ success: false, error: reason });

export const validateAuthorization = (req) => {
    const authHeader = req.get('Authorization');

    if (typeof authHeader !== 'string') {
        return err("missing");
    }

    const [ authType, keyString ] = authHeader.split(' ', 2);
    if (authType.toLowerCase() !== 'api-key') {
        return err("not_api_key");
    }

    if (!UUID_REGEX.test(keyString) || `${authType} ${keyString}` !== authHeader) {
        return err("invalid");
    }

    const matchingKey = keys[keyString.toLowerCase()];
    if (!matchingKey) {
        return err("not_found");
    }

    if (matchingKey.ips) {
        let addr;
        try {
            addr = ip.parse(req.ip);
        } catch {
            return err("invalid_ip");
        }

        const ip_allowed = matchingKey.ips.some(
            ([ allowed, size ]) => {
                return addr.kind() === allowed.kind()
                        && addr.match(allowed, size);
            }
        );

        if (!ip_allowed) {
            return err("ip_not_allowed");
        }
    }

    if (matchingKey.userAgents) {
        const userAgent = req.get('User-Agent');
        if (!matchingKey.userAgents.some(regex => regex.test(userAgent))) {
            return err("ua_not_allowed");
        }
    }

    req.rateLimitKey = keyString.toLowerCase();
    req.rateLimitMax = matchingKey.limit;

    return { success: true };
}

export const setup = (url) => {
    if (cluster.isPrimary) {
        wrapLoad(url, true);
        if (env.keyReloadInterval > 0 && url.protocol !== 'file:') {
            setInterval(() => wrapLoad(url), env.keyReloadInterval * 1000);
        }
    } else if (cluster.isWorker) {
        process.on('message', (message) => {
            if ('api_keys' in message) {
                updateKeys(message.api_keys);
            }
        });
    }
}

export const getAllowedServices = (key) => {
    if (typeof key !== "string") return;

    const allowedServices = keys[key.toLowerCase()]?.allowedServices;
    if (!allowedServices) return;

    if (allowedServices === "all") {
        return env.allServices;
    }
    return allowedServices;
}
