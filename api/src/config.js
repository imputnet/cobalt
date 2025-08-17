import { getVersion } from "@imput/version-info";
import { loadEnvs, validateEnvs } from "./core/env.js";

const version = await getVersion();


const disabledServices = process.env.DISABLED_SERVICES?.split(',') || [];
const enabledServices = new Set(Object.keys(services).filter(e => {
    if (!disabledServices.includes(e)) {
        return e;
    }
}));

const env = {
    apiURL: process.env.API_URL || '',
    apiPort: process.env.API_PORT || 9000,
    tunnelPort: process.env.API_PORT || 9000,

    listenAddress: process.env.API_LISTEN_ADDRESS,
    freebindCIDR: process.platform === 'linux' && process.env.FREEBIND_CIDR,

    corsWildcard: process.env.CORS_WILDCARD !== '0',
    corsURL: process.env.CORS_URL,

    cookiePath: process.env.COOKIE_PATH,

    rateLimitWindow: (process.env.RATELIMIT_WINDOW && parseInt(process.env.RATELIMIT_WINDOW)) || 60,
    rateLimitMax: (process.env.RATELIMIT_MAX && parseInt(process.env.RATELIMIT_MAX)) || 20,

    durationLimit: (process.env.DURATION_LIMIT && parseInt(process.env.DURATION_LIMIT)) || 10800,
    streamLifespan: (process.env.TUNNEL_LIFESPAN && parseInt(process.env.TUNNEL_LIFESPAN)) || 90,

    processingPriority: process.platform !== 'win32'
        && process.env.PROCESSING_PRIORITY
        && parseInt(process.env.PROCESSING_PRIORITY),

    externalProxy: process.env.API_EXTERNAL_PROXY,

    turnstileSitekey: process.env.TURNSTILE_SITEKEY,
    turnstileSecret: process.env.TURNSTILE_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: (process.env.JWT_EXPIRY && parseInt(process.env.JWT_EXPIRY)) || 120,
=======
const canonicalEnv = Object.freeze(structuredClone(process.env));
const env = loadEnvs();


const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
const cobaltUserAgent = `cobalt/${version} (+https://github.com/imputnet/cobalt)`;

export const setTunnelPort = (port) => env.tunnelPort = port;
export const isCluster = env.instanceCount > 1;
export const updateEnv = (newEnv) => {
    const changes = [];

    // tunnelPort is special and needs to get carried over here
    newEnv.tunnelPort = env.tunnelPort;

    for (const key in env) {
        if (key === 'subscribe') {
            continue;
        }

        if (String(env[key]) !== String(newEnv[key])) {
            changes.push(key);
        }
        env[key] = newEnv[key];
    }

    return changes;
}

await validateEnvs(env);

export {
    env,
    canonicalEnv,
    genericUserAgent,
    cobaltUserAgent,
}
