/**
 * YTubeDL Engine — public API.
 *
 * The upgraded YouTube download engine: modular, power-efficient, super-fast.
 * Zero npm dependencies. Runs on Node.js 18+ and Bun.
 *
 * Three integration tiers — use whichever fits your project:
 *   1. Library:      new YTubeDL(…) — embed the engine directly
 *   2. Web router:   createEngineRouter(engine) — mount into any Fetch server
 *   3. CLI server:   `ytubedl-engine` bin / src/server/cli.ts — zero-code API
 */
export { YTubeDL } from './engine.js';
/* Contract types & constants */
export { ENGINE_VERSION, ENGINE_NAME, } from './types.js';
/* Configuration & profiles */
export { PROFILES, profileSpec, setDataRoot, dataDir, filesDir, tmpDir, demoDir, settingsPath, statePath, defaultServerPort, demoOriginPort, ensureDataDirs, loadConfig, saveConfig, } from './config.js';
/* Independent capabilities — usable without the job queue */
export { parseTarget, extractLinks } from './url.js';
export { downloadCaption, fetchCaptionJson3, json3ToCues, cuesToSrt, cuesToVtt } from './subtitles.js';
export { downloadStream } from './download/segment-downloader.js';
export { planVideo, planAudio, runMux, runAudioExtract } from './download/pipelines.js';
export { runFfmpeg, ffmpegVersion, argsTranscodeVideo } from './download/ffmpeg.js';
export { probeUrl, analyzeInputs, clearProbeCache, isFormatsBlocked } from './providers/index.js';
/* HTTP tier */
export { createEngineRouter } from './server/api.js';
export { nodeRequestToWeb, sendWebResponse } from './node-bridge.js';
export { serveFileResponse, parseRange, jsonOk, jsonError, CORS_HEADERS } from './serve.js';
/* Provider extension points — implement TubeProvider to add platforms */
export { YouTubeProvider, youtubePlaylist, youtubeHealth } from './providers/youtube.js';
export { DemoProvider, demoPlaylist } from './providers/demo.js';
export { DirectProvider } from './providers/direct.js';
/* Job manager (advanced usage) */
export { JobManager } from './queue.js';
