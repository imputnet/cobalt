import Cookie from './cookie.js';

import { readFile, writeFile } from 'fs/promises';
import { Red, Green, Yellow } from '../../misc/console-text.js';
import { parse as parseSetCookie, splitCookiesString } from 'set-cookie-parser';
import * as cluster from '../../misc/cluster.js';
import { isCluster } from '../../config.js';

const WRITE_INTERVAL = 60000;
const VALID_SERVICES = new Set([
    'instagram',
    'instagram_bearer',
    'reddit',
    'twitter',
    'youtube',
]);

const invalidCookies = {};
let cookies = {}, dirty = false, intervalId;

function writeChanges(cookiePath) {
    if (!dirty) return;
    dirty = false;

    const cookieData = JSON.stringify({ ...cookies, ...invalidCookies }, null, 4);
    writeFile(cookiePath, cookieData).catch((e) => {
        console.warn(`${Yellow('[!]')} failed writing updated cookies to storage`);
        console.warn(e);
        clearInterval(intervalId);
        intervalId = null;
    })
}

const setupMain = async (cookiePath) => {
    try {
        cookies = await readFile(cookiePath, 'utf8');
        cookies = JSON.parse(cookies);
        for (const serviceName in cookies) {
            if (!VALID_SERVICES.has(serviceName)) {
                console.warn(`${Yellow('[!]')} ignoring unknown service in cookie file: ${serviceName}`);
            } else if (!Array.isArray(cookies[serviceName])) {
                console.warn(`${Yellow('[!]')} ${serviceName} in cookies file is not an array, ignoring it`);
            } else if (cookies[serviceName].some(c => typeof c !== 'string')) {
                console.warn(`${Yellow('[!]')} some cookie for ${serviceName} contains non-string value in cookies file`);
            } else continue;

            invalidCookies[serviceName] = cookies[serviceName];
            delete cookies[serviceName];
        }

        if (!intervalId) {
            intervalId = setInterval(() => writeChanges(cookiePath), WRITE_INTERVAL);
        }

        cluster.broadcast({ cookies });

        console.log(`${Green('[✓]')} cookies loaded successfully!`);
    } catch (e) {
        console.error(`${Yellow('[!]')} failed to load cookies.`);
        console.error('error:', e);
    }
}

const setupWorker = async () => {
    cookies = (await cluster.waitFor('cookies')).cookies;
}

export const loadFromFile = async (path) => {
    if (cluster.isPrimary) {
        await setupMain(path);
    } else if (cluster.isWorker) {
        await setupWorker();
    }

    dirty = false;
}

export const setup = async (path) => {
    await loadFromFile(path);

    if (isCluster) {
        const messageHandler = (message) => {
            if ('cookieUpdate' in message) {
                const { cookieUpdate } = message;

                if (cluster.isPrimary) {
                    dirty = true;
                    cluster.broadcast({ cookieUpdate });
                }

                const { service, idx, cookie } = cookieUpdate;
                cookies[service][idx] = cookie;
            }
        }

        if (cluster.isPrimary) {
            cluster.mainOnMessage(messageHandler);
        } else {
            process.on('message', messageHandler);
        }
    }
}

export function getCookie(service) {
    if (!VALID_SERVICES.has(service)) {
        console.error(
            `${Red('[!]')} ${service} not in allowed services list for cookies.`
            + ' if adding a new cookie type, include it there.'
        );
        return;
    }

    if (!cookies[service] || !cookies[service].length) return;

    const idx = Math.floor(Math.random() * cookies[service].length);

    const cookie = cookies[service][idx];
    if (typeof cookie === 'string') {
        cookies[service][idx] = Cookie.fromString(cookie);
    }

    cookies[service][idx].meta = { service, idx };
    return cookies[service][idx];
}

export function updateCookieValues(cookie, values) {
    let changed = false;

    for (const [ key, value ] of Object.entries(values)) {
        changed = cookie.set(key, value) || changed;
    }

    if (changed && cookie.meta) {
        dirty = true;
        if (isCluster) {
            const message = { cookieUpdate: { ...cookie.meta, cookie } };
            cluster.send(message);
        }
    }

    return changed;
}

export function updateCookie(cookie, headers) {
    if (!cookie) return;

    const parsed = parseSetCookie(
        splitCookiesString(headers.get('set-cookie')),
        { decodeValues: false }
    ), values = {}

    cookie.unset(parsed.filter(c => c.expires < new Date()).map(c => c.name));
    parsed.filter(c => !c.expires || c.expires > new Date()).forEach(c => values[c.name] = c.value);

    updateCookieValues(cookie, values);
}
