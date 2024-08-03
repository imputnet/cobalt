import UrlPattern from "url-pattern";
import { loadJSON } from "./sub/loadFromFs.js";

const config = loadJSON("./src/config.json");
const packageJson = loadJSON("./package.json");
const servicesConfigJson = loadJSON("./src/modules/processing/servicesConfig.json");

Object.values(servicesConfigJson.config).forEach(service => {
    service.patterns = service.patterns.map(
        pattern => new UrlPattern(pattern, {
            segmentValueCharset: UrlPattern.defaultOptions.segmentValueCharset + '@\\.'
        })
    )
})

export const
    services = servicesConfigJson.config,
    hlsExceptions = servicesConfigJson.hlsExceptions,
    audioIgnore = servicesConfigJson.audioIgnore,
    version = packageJson.version,
    genericUserAgent = config.genericUserAgent,
    ffmpegArgs = config.ffmpegArgs,
    supportedAudio = config.supportedAudio,
    env = {
        apiURL: process.env.API_URL || '',
        apiPort: process.env.API_PORT || 9000,

        listenAddress: process.env.API_LISTEN_ADDRESS,
        freebindCIDR: process.platform === 'linux' && process.env.FREEBIND_CIDR,

        corsWildcard: process.env.CORS_WILDCARD !== '0',
        corsURL: process.env.CORS_URL,

        cookiePath: process.env.COOKIE_PATH,

        rateLimitWindow: (process.env.RATELIMIT_WINDOW  && parseInt(process.env.RATELIMIT_WINDOW)) || 60,
        rateLimitMax: (process.env.RATELIMIT_MAX && parseInt(process.env.RATELIMIT_MAX)) || 20,

        durationLimit: (process.env.DURATION_LIMIT && parseInt(process.env.DURATION_LIMIT)) || 10800,
        streamLifespan: 90,

        processingPriority: process.platform !== 'win32'
                                && process.env.PROCESSING_PRIORITY
                                && parseInt(process.env.PROCESSING_PRIORITY),

        externalProxy: process.env.API_EXTERNAL_PROXY,
    }
