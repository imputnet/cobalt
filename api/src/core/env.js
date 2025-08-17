import { Constants } from "youtubei.js";
import { services } from "../processing/service-config.js";
import { updateEnv, canonicalEnv, env as currentEnv } from "../config.js";

import { FileWatcher } from "../misc/file-watcher.js";
import { isURL } from "../misc/utils.js";
import * as cluster from "../misc/cluster.js";
import { Green, Yellow } from "../misc/console-text.js";

const forceLocalProcessingOptions = ["never", "session", "always"];
const youtubeHlsOptions = ["never", "key", "always"];

const httpProxyVariables = ["NO_PROXY", "HTTP_PROXY", "HTTPS_PROXY"].flatMap(
    k => [ k, k.toLowerCase() ]
);

const changeCallbacks = {};

const onEnvChanged = (changes) => {
    for (const key of changes) {
        if (changeCallbacks[key]) {
            changeCallbacks[key].map(fn => {
                try { fn() } catch {}
            });
        }
    }
}

const subscribe = (keys, fn) => {
    keys = [keys].flat();

    for (const key of keys) {
        if (key in currentEnv && key !== 'subscribe') {
            changeCallbacks[key] ??= [];
            changeCallbacks[key].push(fn);
            fn();
        } else throw `invalid env key ${key}`;
    }
}

export const loadEnvs = (env = process.env) => {
    const allServices = new Set(Object.keys(services));
    const disabledServices = env.DISABLED_SERVICES?.split(',') || [];
    const enabledServices = new Set(Object.keys(services).filter(e => {
        if (!disabledServices.includes(e)) {
            return e;
        }
    }));

    // we need to copy the proxy envs (HTTP_PROXY, HTTPS_PROXY)
    // back into process.env, so that EnvHttpProxyAgent can pick
    // them up later
    for (const key of httpProxyVariables) {
        const value = env[key] ?? canonicalEnv[key];
        if (value !== undefined) {
            process.env[key] = env[key];
        } else {
            delete process.env[key];
        }
    }

    return {
        apiURL: env.API_URL || '',
        apiPort: env.API_PORT || 9000,
        tunnelPort: env.API_PORT || 9000,

        listenAddress: env.API_LISTEN_ADDRESS,
        freebindCIDR: process.platform === 'linux' && env.FREEBIND_CIDR,

        corsWildcard: env.CORS_WILDCARD !== '0',
        corsURL: env.CORS_URL,

        cookiePath: env.COOKIE_PATH,

        rateLimitWindow: (env.RATELIMIT_WINDOW && parseInt(env.RATELIMIT_WINDOW)) || 60,
        rateLimitMax: (env.RATELIMIT_MAX && parseInt(env.RATELIMIT_MAX)) || 20,

        tunnelRateLimitWindow: (env.TUNNEL_RATELIMIT_WINDOW && parseInt(env.TUNNEL_RATELIMIT_WINDOW)) || 60,
        tunnelRateLimitMax: (env.TUNNEL_RATELIMIT_MAX && parseInt(env.TUNNEL_RATELIMIT_MAX)) || 40,

        sessionRateLimitWindow: (env.SESSION_RATELIMIT_WINDOW && parseInt(env.SESSION_RATELIMIT_WINDOW)) || 60,
        sessionRateLimit:
            // backwards compatibility with SESSION_RATELIMIT
            // till next major due to an error in docs
            (env.SESSION_RATELIMIT_MAX && parseInt(env.SESSION_RATELIMIT_MAX))
            || (env.SESSION_RATELIMIT && parseInt(env.SESSION_RATELIMIT))
            || 10,

        durationLimit: (env.DURATION_LIMIT && parseInt(env.DURATION_LIMIT)) || 10800,
        streamLifespan: (env.TUNNEL_LIFESPAN && parseInt(env.TUNNEL_LIFESPAN)) || 90,

        processingPriority: process.platform !== 'win32'
            && env.PROCESSING_PRIORITY
            && parseInt(env.PROCESSING_PRIORITY),

        externalProxy: env.API_EXTERNAL_PROXY,

        // used only for comparing against old values when envs are being updated
        httpProxyValues: httpProxyVariables.map(k => String(env[k])).join(''),

        turnstileSitekey: env.TURNSTILE_SITEKEY,
        turnstileSecret: env.TURNSTILE_SECRET,
        jwtSecret: env.JWT_SECRET,
        jwtLifetime: env.JWT_EXPIRY || 120,

        sessionEnabled: env.TURNSTILE_SITEKEY
                            && env.TURNSTILE_SECRET
                            && env.JWT_SECRET,

        apiKeyURL: env.API_KEY_URL && new URL(env.API_KEY_URL),
        authRequired: env.API_AUTH_REQUIRED === '1',
        redisURL: env.API_REDIS_URL,
        instanceCount: (env.API_INSTANCE_COUNT && parseInt(env.API_INSTANCE_COUNT)) || 1,
        keyReloadInterval: 900,

        allServices,
        enabledServices,

        customInnertubeClient: env.CUSTOM_INNERTUBE_CLIENT,
        ytSessionServer: env.YOUTUBE_SESSION_SERVER,
        ytSessionReloadInterval: 300,
        ytSessionInnertubeClient: env.YOUTUBE_SESSION_INNERTUBE_CLIENT,
        ytAllowBetterAudio: env.YOUTUBE_ALLOW_BETTER_AUDIO !== "0",

        // "never" | "session" | "always"
        forceLocalProcessing: env.FORCE_LOCAL_PROCESSING ?? "never",

        // "never" | "key" | "always"
        enableDeprecatedYoutubeHls: env.ENABLE_DEPRECATED_YOUTUBE_HLS ?? "never",

        envFile: env.API_ENV_FILE,
        envRemoteReloadInterval: 300,

        subscribe,
    };
}

let loggedProxyWarning = false;

export const validateEnvs = async (env) => {
    if (env.sessionEnabled && env.jwtSecret.length < 16) {
        throw new Error("JWT_SECRET env is too short (must be at least 16 characters long)");
    }

    if (env.instanceCount > 1 && !env.redisURL) {
        throw new Error("API_REDIS_URL is required when API_INSTANCE_COUNT is >= 2");
    } else if (env.instanceCount > 1 && !await cluster.supportsReusePort()) {
        console.error('API_INSTANCE_COUNT is not supported in your environment. to use this env, your node.js');
        console.error('version must be >= 23.1.0, and you must be running a recent enough version of linux');
        console.error('(or other OS that supports it). for more info, see `reusePort` option on');
        console.error('https://nodejs.org/api/net.html#serverlistenoptions-callback');
        throw new Error('SO_REUSEPORT is not supported');
    }

    if (env.customInnertubeClient && !Constants.SUPPORTED_CLIENTS.includes(env.customInnertubeClient)) {
        console.error("CUSTOM_INNERTUBE_CLIENT is invalid. Provided client is not supported.");
        console.error(`Supported clients are: ${Constants.SUPPORTED_CLIENTS.join(', ')}\n`);
        throw new Error("Invalid CUSTOM_INNERTUBE_CLIENT");
    }

    if (env.forceLocalProcessing && !forceLocalProcessingOptions.includes(env.forceLocalProcessing)) {
        console.error("FORCE_LOCAL_PROCESSING is invalid.");
        console.error(`Supported options are are: ${forceLocalProcessingOptions.join(', ')}\n`);
        throw new Error("Invalid FORCE_LOCAL_PROCESSING");
    }

    if (env.enableDeprecatedYoutubeHls && !youtubeHlsOptions.includes(env.enableDeprecatedYoutubeHls)) {
        console.error("ENABLE_DEPRECATED_YOUTUBE_HLS is invalid.");
        console.error(`Supported options are are: ${youtubeHlsOptions.join(', ')}\n`);
        throw new Error("Invalid ENABLE_DEPRECATED_YOUTUBE_HLS");
    }

    if (env.externalProxy && env.freebindCIDR) {
        throw new Error('freebind is not available when external proxy is enabled')
    }

    if (env.externalProxy && !loggedProxyWarning) {
        console.error('API_EXTERNAL_PROXY is deprecated and will be removed in a future release.');
        console.error('Use HTTP_PROXY or HTTPS_PROXY instead.');
        console.error('You can read more about the new proxy variables in docs/api-env-variables.md\n');

        // prevent the warning from being printed on every env validation
        loggedProxyWarning = true;
    }

    return env;
}

const reloadEnvs = async (contents) => {
    const newEnvs = {};
    const resolvedContents = await contents;

    for (let line of resolvedContents.split('\n')) {
        line = line.trim();
        if (line === '') {
            continue;
        }

        let [ key, value ] = line.split(/=(.+)?/);
        if (key) {
            if (value.match(/^['"]/) && value.match(/['"]$/)) {
                value = JSON.parse(value);
            }

            newEnvs[key] = value || '';
        }
    }

    const candidate = {
        ...canonicalEnv,
        ...newEnvs,
    };

    const parsed = await validateEnvs(
        loadEnvs(candidate)
    );

    cluster.broadcast({ env_update: resolvedContents });
    return updateEnv(parsed);
}

const wrapReload = (contents) => {
    reloadEnvs(contents)
    .then(changes => {
        if (changes.length === 0) {
            return;
        }

        onEnvChanged(changes);

        console.log(`${Green('[✓]')} envs reloaded successfully!`);
        for (const key of changes) {
            const value = currentEnv[key];
            const isSecret = key.toLowerCase().includes('apikey')
                          || key.toLowerCase().includes('secret')
                          || key === 'httpProxyValues';

            if (!value) {
                console.log(`    removed: ${key}`);
            } else {
                console.log(`    changed: ${key} -> ${isSecret ? '***' : value}`);
            }
        }
    })
    .catch((e) => {
        console.error(`${Yellow('[!]')} Failed reloading environment variables at ${new Date().toISOString()}.`);
        console.error('Error:', e);
    });
}

let watcher;
const setupWatcherFromFile = (path) => {
    const load = () => wrapReload(watcher.read());

    if (isURL(path)) {
        watcher = FileWatcher.fromFileProtocol(path);
    } else {
        watcher = new FileWatcher({ path });
    }

    watcher.on('file-updated', load);
    load();
}

const setupWatcherFromFetch = (url) => {
    const load = () => wrapReload(fetch(url).then(r => r.text()));
    setInterval(load, currentEnv.envRemoteReloadInterval);
    load();
}

export const setupEnvWatcher = () => {
    if (cluster.isPrimary) {
        const envFile = currentEnv.envFile;
        const isFile = !isURL(envFile)
                       || new URL(envFile).protocol === 'file:';

        if (isFile) {
            setupWatcherFromFile(envFile);
        } else {
            setupWatcherFromFetch(envFile);
        }
    } else if (cluster.isWorker) {
        process.on('message', (message) => {
            if ('env_update' in message) {
                reloadEnvs(message.env_update);
            }
        });
    }
}
