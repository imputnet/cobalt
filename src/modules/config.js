import loadJson from "./sub/loadJSON.js";
const config = loadJson("./src/config.json");
const packageJson = loadJson("./package.json");
const servicesConfigJson = loadJson("./src/modules/processing/servicesConfig.json");

export const
    services = servicesConfigJson.config,
    audioIgnore = servicesConfigJson.audioIgnore,
    version = packageJson.version,
    streamLifespan = config.streamLifespan,
    maxVideoDuration = config.maxVideoDuration,
    genericUserAgent = config.genericUserAgent,
    repo = packageJson["bugs"]["url"].replace('/issues', ''),
    authorInfo = config.authorInfo,
    donations = config.donations,
    ffmpegArgs = config.ffmpegArgs,
    supportedAudio = config.supportedAudio,
    celebrations = config.celebrations,
    links = config.links
