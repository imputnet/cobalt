/**
 * YTubeDL Engine — runtime configuration, profiles and data directories.
 *
 * Power-efficiency profiles control the downloader's parallelism:
 *  - power-saver:  fewer connections / larger segments / capped encoder
 *                  threads → lowest CPU + network overhead
 *  - balanced:     sensible defaults
 *  - performance:  more parallel segments, smaller segments → max throughput
 *
 * The data root is resolved once per process, in this order:
 *   1. `engine.init({ dataDir })` / `new YTubeDL({ dataDir })`
 *   2. `YTUBEDL_DATA_DIR` environment variable
 *      (legacy `YTUBEDL_DATA_DIR` / `COALTDL_DATA_DIR` still read)
 *   3. `<process.cwd()>/ytubedl-data`
 */
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
/* ------------------------------ data root ------------------------------ */
let dataRoot = null;
/** Set the engine data root (must be called before the first job). */
export function setDataRoot(dir) {
    dataRoot = resolve(dir);
}
/** Resolved data root (lazily defaulting to env/cwd). */
export function dataDir() {
    if (!dataRoot) {
        dataRoot = resolve(process.env.YTUBEDL_DATA_DIR
            ?? process.env.COALTDL_DATA_DIR
            ?? process.env.YTUBEDL_DATA_DIR
            ?? join(process.cwd(), 'ytubedl-data'));
    }
    return dataRoot;
}
export function filesDir() {
    return join(dataDir(), 'files');
}
export function tmpDir() {
    return join(dataDir(), 'tmp');
}
export function demoDir() {
    return join(dataDir(), 'demo-origin');
}
export function settingsPath() {
    return join(dataDir(), 'settings.json');
}
export function statePath() {
    return join(dataDir(), 'state.json');
}
/** Demo origin port: explicit env or OS-assigned ephemeral (never collides). */
export function demoOriginPort() {
    const n = Number(process.env.YTUBEDL_DEMO_PORT ?? process.env.YTUBEDL_DEMO_PORT);
    return Number.isInteger(n) && n > 0 && n < 65536 ? n : 0;
}
/** Default port for the standalone HTTP server (env `YTUBEDL_PORT`). */
export function defaultServerPort() {
    const n = Number(process.env.YTUBEDL_PORT ?? process.env.COALTDL_PORT ?? process.env.YTUBEDL_PORT);
    return Number.isInteger(n) && n > 0 && n < 65536 ? n : 3020;
}
export async function ensureDataDirs() {
    await Promise.all([filesDir(), tmpDir(), demoDir()].map((d) => mkdir(d, { recursive: true })));
}
export const PROFILES = {
    'power-saver': { maxSegments: 2, segmentBytes: 8 * 1024 * 1024, maxStreamsParallel: 1, transcodeThreads: 2 },
    balanced: { maxSegments: 4, segmentBytes: 6 * 1024 * 1024, maxStreamsParallel: 2, transcodeThreads: 0 },
    performance: { maxSegments: 8, segmentBytes: 4 * 1024 * 1024, maxStreamsParallel: 2, transcodeThreads: 0 },
};
const DEFAULT_CONFIG = { concurrency: 2, profile: 'balanced' };
export async function loadConfig() {
    try {
        const p = settingsPath();
        if (!existsSync(p))
            return { ...DEFAULT_CONFIG };
        const raw = JSON.parse(await readFile(p, 'utf8'));
        return {
            concurrency: clamp(Number(raw?.concurrency) || DEFAULT_CONFIG.concurrency, 1, 4),
            profile: ['power-saver', 'balanced', 'performance'].includes(raw?.profile)
                ? raw.profile
                : 'balanced',
        };
    }
    catch {
        return { ...DEFAULT_CONFIG };
    }
}
export async function saveConfig(cfg) {
    await mkdir(dataDir(), { recursive: true });
    await writeFile(settingsPath(), JSON.stringify(cfg, null, 2), 'utf8');
}
export function profileSpec(cfg) {
    return PROFILES[cfg.profile] ?? PROFILES.balanced;
}
function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}
