import { parseTarget } from '../url.js';
import { DemoProvider, demoPlaylist } from './demo.js';
import { DirectProvider } from './direct.js';
import { YouTubeProvider, youtubePlaylist } from './youtube.js';
import { demoState } from '../demo-origin.js';
const demoProvider = new DemoProvider();
const directProvider = new DirectProvider();
const youtubeProvider = new YouTubeProvider();
/* ------------------------------ caching ------------------------------- */
const PROBE_TTL = 10 * 60_000;
const probeCache = new Map();
const PROBE_CACHE_LIMIT = 40;
function cacheGet(url) {
    const hit = probeCache.get(url);
    if (!hit)
        return undefined;
    if (Date.now() - hit.at > PROBE_TTL) {
        probeCache.delete(url);
        return undefined;
    }
    return hit.result;
}
function cachePut(url, result) {
    if (probeCache.has(url))
        probeCache.delete(url);
    probeCache.set(url, { at: Date.now(), result });
    while (probeCache.size > PROBE_CACHE_LIMIT) {
        probeCache.delete(probeCache.keys().next().value);
    }
}
export function clearProbeCache() {
    probeCache.clear();
}
/* ------------------------------ probing ------------------------------- */
/** Probe a single video URL into a full provider result. */
export async function probeUrl(url, opts = {}) {
    if (!opts.refresh) {
        const cached = cacheGet(url);
        if (cached)
            return cached;
    }
    const target = parseTarget(url);
    let result;
    switch (target.type) {
        case 'demo-video':
            result = await demoProvider.probe(url, opts);
            break;
        case 'youtube-video':
            result = await youtubeProvider.probe(url, opts);
            break;
        case 'direct':
            result = await directProvider.probe(url, opts);
            break;
        case 'demo-playlist':
        case 'youtube-playlist':
            throw new Error('Playlist URL — expand it first via analyze()');
        default:
            // Last resort: maybe it's a direct media URL
            result = await directProvider.probe(url, opts);
    }
    // never cache negative (formats-blocked) results — a transient upstream
    // failure would otherwise fail the same link for the full TTL
    if (result.streams.size > 0) {
        cachePut(url, result);
    }
    return result;
}
/** True when probe succeeded but no downloadable formats exist (IP block etc). */
export function isFormatsBlocked(result) {
    return result.streams.size === 0;
}
/* ------------------------------ analyze ------------------------------- */
/**
 * Analyze a list of user inputs (single or batch): expands playlists,
 * probes each video, returns per-input results. A failing item never fails
 * the batch.
 */
export async function analyzeInputs(inputs, opts = {}) {
    const out = [];
    for (const input of inputs) {
        const target = parseTarget(input);
        try {
            if ((target.type === 'youtube-playlist' || target.type === 'demo-playlist') &&
                opts.expandPlaylists !== false) {
                if (target.type === 'demo-playlist') {
                    const pl = demoPlaylist(target.playlistId);
                    for (const v of pl.videos) {
                        const watchUrl = `https://demo.local/watch?v=${v.id}`;
                        try {
                            const result = await probeUrl(watchUrl, opts);
                            out.push({ input, ok: true, media: result.media });
                        }
                        catch (e) {
                            out.push({ input: watchUrl, ok: false, error: e instanceof Error ? e.message : String(e) });
                        }
                    }
                }
                else {
                    const pl = await youtubePlaylist(target.playlistId, opts.signal);
                    for (const v of pl.videos) {
                        const watchUrl = `https://www.youtube.com/watch?v=${v.id}`;
                        try {
                            const result = await probeUrl(watchUrl, opts);
                            out.push({ input, ok: true, media: result.media });
                        }
                        catch (e) {
                            // Metadata-only entries still succeed if oEmbed resolved them
                            const result = await youtubeProviderSafe(watchUrl, opts);
                            if (result) {
                                out.push({ input, ok: true, media: result.media });
                            }
                            else {
                                out.push({ input: watchUrl, ok: false, error: e instanceof Error ? e.message : String(e) });
                            }
                        }
                    }
                }
                continue;
            }
            if (target.type === 'unknown') {
                // Give direct provider a chance; otherwise explain
                try {
                    const result = await directProvider.probe(input, opts);
                    out.push({ input, ok: true, media: result.media });
                }
                catch (e) {
                    out.push({
                        input,
                        ok: false,
                        error: 'Not a YouTube link or media URL. Supported: youtube.com/watch, youtu.be, shorts, playlists, or direct media file links.',
                    });
                }
                continue;
            }
            const result = await probeUrl(input, opts);
            out.push({ input, ok: true, media: result.media });
        }
        catch (e) {
            out.push({ input, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
    }
    return out;
}
async function youtubeProviderSafe(url, opts) {
    try {
        return await youtubeProvider.probe(url, opts);
    }
    catch {
        return null;
    }
}
export { demoState };
