import loadJson from "./sub/load-json.js";

let config = loadJson("./config.json");
let services = loadJson("./modules/services/all.json");

let appName = config.appName
let version = config.version
let streamLifespan = config.streamLifespan
let maxVideoDuration = config.maxVideoDuration
let genericUserAgent = config.genericUserAgent
let repo = config.repo
let authorInfo = config.authorInfo
let supportedLanguages = config.supportedLanguages
let quality = config.quality
let internetExplorerRedirect = config.internetExplorerRedirect
let donations = config.donations
let ffmpegArgs = config.ffmpegArgs 

export {appName, version, streamLifespan, maxVideoDuration, genericUserAgent, repo, authorInfo, services, supportedLanguages, quality, internetExplorerRedirect, donations, ffmpegArgs}