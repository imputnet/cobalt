import { getVersion } from "@imput/version-info";
import { services } from "./processing/service-config.js";

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

    listenAddress: process.env.API_LISTEN_ADDRESS,
    freebindCIDR: process.platform === 'linux' && process.env.FREEBIND_CIDR,

    corsWildcard: process.env.CORS_WILDCARD !== '0',
    corsURL: process.env.CORS_URL,

    cookiePath: process.env.COOKIE_PATH,

    rateLimitWindow: (process.env.RATELIMIT_WINDOW && parseInt(process.env.RATELIMIT_WINDOW)) || 60,
    rateLimitMax: (process.env.RATELIMIT_MAX && parseInt(process.env.RATELIMIT_MAX)) || 20,

    durationLimit: (process.env.DURATION_LIMIT && parseInt(process.env.DURATION_LIMIT)) || 10800,
    streamLifespan: 90,

    processingPriority: process.platform !== 'win32'
        && process.env.PROCESSING_PRIORITY
        && parseInt(process.env.PROCESSING_PRIORITY),

    externalProxy: process.env.API_EXTERNAL_PROXY,

    turnstileSecret: process.env.TURNSTILE_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: process.env.JWT_EXPIRY || 120,

    enabledServices,
}

const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const cobaltUserAgent = `cobalt/${version} (+https://github.com/imputnet/cobalt)`;

export {
    env,
    genericUserAgent,
    cobaltUserAgent,
}
