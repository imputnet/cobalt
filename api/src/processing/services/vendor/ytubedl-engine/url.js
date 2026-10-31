const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const YT_ID_GLOBAL = /[A-Za-z0-9_-]{11}(?![A-Za-z0-9_-])/;
const MEDIA_EXT = /\.(mp4|m4v|webm|mkv|mov|avi|3gp|m4a|opus|mp3|wav|flac|ogg|aac)(\?|#|$)/i;
/** Parse a single user-submitted link (or bare id). */
export function parseTarget(input) {
    const url = input.trim();
    if (!url)
        return { type: 'unknown', url };
    // Explicit direct marker
    if (/^direct:https?:\/\//i.test(url)) {
        return { type: 'direct', url: url.slice('direct:'.length) };
    }
    let parsed = null;
    try {
        parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    }
    catch {
        parsed = null;
    }
    if (parsed) {
        const host = parsed.hostname.toLowerCase();
        // Demo origin (documented demo links)
        if (host === 'demo.local') {
            const v = parsed.searchParams.get('v');
            const list = parsed.searchParams.get('list');
            if (parsed.pathname === '/playlist' && list) {
                return { type: 'demo-playlist', url, playlistId: list };
            }
            if (v && YT_ID.test(v))
                return { type: 'demo-video', url, videoId: v };
            return { type: 'unknown', url };
        }
        const isYouTubeHost = host === 'youtu.be' ||
            host.endsWith('.youtube.com') ||
            host === 'youtube.com' ||
            host === 'youtube-nocookie.com' ||
            host === 'm.youtube.com' ||
            host === 'music.youtube.com';
        if (isYouTubeHost) {
            const list = parsed.searchParams.get('list');
            if (parsed.pathname === '/playlist' && list) {
                return { type: 'youtube-playlist', url, playlistId: list };
            }
            // watch?v= (works on www/m/music)
            const v = parsed.searchParams.get('v');
            if (v && YT_ID.test(v)) {
                return { type: 'youtube-video', url, videoId: v };
            }
            if (host === 'youtu.be') {
                const id = parsed.pathname.slice(1).split('/')[0] ?? '';
                if (YT_ID.test(id))
                    return { type: 'youtube-video', url, videoId: id };
            }
            const m = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
            if (m)
                return { type: 'youtube-video', url, videoId: m[1] };
            // A watch URL with both v and list is treated as a single video (standard behavior)
            if (list)
                return { type: 'youtube-playlist', url, playlistId: list };
            return { type: 'unknown', url };
        }
        if (MEDIA_EXT.test(parsed.pathname)) {
            return { type: 'direct', url: parsed.toString() };
        }
        return { type: 'unknown', url: parsed.toString() };
    }
    // Bare YouTube id
    if (YT_ID.test(url)) {
        return { type: 'youtube-video', url: `https://www.youtube.com/watch?v=${url}`, videoId: url };
    }
    // youtube:VIDEOID convenience form
    const yt = url.match(/^youtube:([A-Za-z0-9_-]{11})$/i);
    if (yt) {
        return { type: 'youtube-video', url: `https://www.youtube.com/watch?v=${yt[1]}`, videoId: yt[1] };
    }
    return { type: 'unknown', url };
}
/**
 * Split a blob of user text into candidate links.
 * Supports whitespace/newline/comma/semicolon separated lists; dedupes (case-insensitive).
 */
export function extractLinks(text, limit = 50) {
    const parts = text
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const p of parts) {
        const key = p.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(p);
        if (out.length >= limit)
            break;
    }
    return out;
}
/** Build a friendly analysis error item. */
export function analyzeError(input, message) {
    return { input, ok: false, error: message };
}
