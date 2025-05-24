import { Constants } from "youtubei.js";
import { supportsReusePort } from "../misc/cluster.js";
import { services } from "../processing/service-config.js";

const forceLocalProcessingOptions = ["never", "session", "always"];

export const loadEnvs = (env = process.env) => {
    const disabledServices = env.DISABLED_SERVICES?.split(',') || [];
    const enabledServices = new Set(Object.keys(services).filter(e => {
        if (!disabledServices.includes(e)) {
            return e;
        }
    }));

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
        sessionRateLimit: (env.SESSION_RATELIMIT && parseInt(env.SESSION_RATELIMIT)) || 10,

        durationLimit: (env.DURATION_LIMIT && parseInt(env.DURATION_LIMIT)) || 10800,
        streamLifespan: (env.TUNNEL_LIFESPAN && parseInt(env.TUNNEL_LIFESPAN)) || 90,

        processingPriority: process.platform !== 'win32'
            && env.PROCESSING_PRIORITY
            && parseInt(env.PROCESSING_PRIORITY),

        externalProxy: env.API_EXTERNAL_PROXY,

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

        enabledServices,

        customInnertubeClient: env.CUSTOM_INNERTUBE_CLIENT,
        ytSessionServer: env.YOUTUBE_SESSION_SERVER,
        ytSessionReloadInterval: 300,
        ytSessionInnertubeClient: env.YOUTUBE_SESSION_INNERTUBE_CLIENT,
        ytAllowBetterAudio: env.YOUTUBE_ALLOW_BETTER_AUDIO !== "0",

        // "never" | "session" | "always"
        forceLocalProcessing: env.FORCE_LOCAL_PROCESSING ?? "never",
    };
}

export const validateEnvs = async (env) => {
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
}
