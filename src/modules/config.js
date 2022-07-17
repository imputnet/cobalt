import loadJson from "./sub/loadJSON.js";
const config = loadJson("./src/config.json");

export const
services = loadJson("./src/modules/services/all.json"),
appName = config.appName,
version = config.version,
streamLifespan = config.streamLifespan,
maxVideoDuration = config.maxVideoDuration,
genericUserAgent = config.genericUserAgent,
repo = config.repo,
authorInfo = config.authorInfo,
supportedLanguages = config.supportedLanguages,
quality = config.quality,
internetExplorerRedirect = config.internetExplorerRedirect,
donations = config.donations,
ffmpegArgs = config.ffmpegArgs