import { getVersion } from "@imput/version-info";
import { services } from "./processing/service-config.js";
import { supportsReusePort } from "./misc/cluster.js";

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
    jwtLifetime: process.env.JWT_EXPIRY || 120,

    sessionEnabled: process.env.TURNSTILE_SITEKEY
                        && process.env.TURNSTILE_SECRET
                        && process.env.JWT_SECRET,

    apiKeyURL: process.env.API_KEY_URL && new URL(process.env.API_KEY_URL),
    authRequired: process.env.API_AUTH_REQUIRED === '1',
    redisURL: process.env.API_REDIS_URL,
    instanceCount: (process.env.API_INSTANCE_COUNT && parseInt(process.env.API_INSTANCE_COUNT)) || 1,
    keyReloadInterval: 900,

    enabledServices,
}

const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const cobaltUserAgent = `cobalt/${version} (+https://github.com/imputnet/cobalt)`;

export const setTunnelPort = (port) => env.tunnelPort = port;
export const isCluster = env.instanceCount > 1;

if (env.sessionEnabled && env.jwtSecret.length < 16) {
    throw new Error("JWT_SECRET env is too short (must be at least 16 characters long)");
}

if (env.instanceCount > 1 && !env.redisURL) {
    throw new Error("API_REDIS_URL is required when API_INSTANCE_COUNT is >= 2");
} else if (env.instanceCount > 1 && !await supportsReusePort()) {
    console.error('API_INSTANCE_COUNT is not supported in your environment. to use this env, your node.js');
    console.error('version must be >= 23.1.0, and you must be running a recent enough version of linux');
    console.error('(or other OS that supports it). for more info, see `reusePort` option on');
    console.error('https://nodejs.org/api/net.html#serverlistenoptions-callback');
    throw new Error('SO_REUSEPORT is not supported');
}

export {
    env,
    genericUserAgent,
    cobaltUserAgent,
}
