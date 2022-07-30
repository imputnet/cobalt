import loadJson from "./sub/loadJSON.js";
const config = loadJson("./src/config.json");
const packageJson = loadJson("./package.json");

export const
services = loadJson("./src/modules/services/_config.json"),
appName = packageJson.name,
version = packageJson.version,
streamLifespan = config.streamLifespan,
maxVideoDuration = config.maxVideoDuration,
genericUserAgent = config.genericUserAgent,
mobileUserAgent = config.mobileUserAgent,
repo = packageJson["bugs"]["url"].replace('/issues', ''),
authorInfo = config.authorInfo,
supportedLanguages = config.supportedLanguages,
quality = config.quality,
internetExplorerRedirect = config.internetExplorerRedirect,
donations = config.donations,
ffmpegArgs = config.ffmpegArgs