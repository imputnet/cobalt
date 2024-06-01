import UrlPattern from "url-pattern";
import { loadJSON } from "./sub/loadFromFs.js";

const config = loadJSON("./src/config.json");
const packageJson = loadJSON("./package.json");
const servicesConfigJson = loadJSON("./src/modules/processing/servicesConfig.json");

Object.values(servicesConfigJson.config).forEach(service => {
    service.patterns = service.patterns.map(
        pattern => new UrlPattern(pattern, {
            segmentValueCharset: UrlPattern.defaultOptions.segmentValueCharset + '@\\.:'
        })
    )
})

const
    apiURL = process.env.API_URL || '',

    // WEB mode related environment variables
    webEnvs = {
        webPort: process.env.WEB_PORT || 9001,
        webURL: process.env.WEB_URL || '',
        showSponsors: !!process.env.SHOW_SPONSORS,
        isBeta: !!process.env.IS_BETA,
        plausibleHostname: process.env.PLAUSIBLE_HOSTNAME,
        apiURL
    },

    // API mode related environment variables
    apiEnvs = {
        apiURL,
        apiPort: process.env.API_PORT || 9000,
        apiName: process.env.API_NAME || 'unknown',

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
                                && parseInt(process.env.PROCESSING_PRIORITY)
    }

export const
    services = servicesConfigJson.config,
    hlsExceptions = servicesConfigJson.hlsExceptions,
    audioIgnore = servicesConfigJson.audioIgnore,
    version = packageJson.version,
    genericUserAgent = config.genericUserAgent,
    repo = packageJson.bugs.url.replace('/issues', ''),
    authorInfo = config.authorInfo,
    donations = config.donations,
    ffmpegArgs = config.ffmpegArgs,
    supportedAudio = config.supportedAudio,
    celebrations = config.celebrations,
    links = config.links,
    sponsors = config.sponsors,
    mode = (apiURL && !webEnvs.webURL) ? 'API' :
        (webEnvs.webURL && apiURL) ? 'WEB' : undefined,
    env = mode === 'API' ? apiEnvs : webEnvs