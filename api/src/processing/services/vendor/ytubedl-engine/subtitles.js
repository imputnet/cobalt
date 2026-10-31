/**
 * YTubeDL Engine — subtitle pipeline.
 *
 * Fetches YouTube caption tracks (json3 format) and converts them to clean,
 * well-formed SRT or VTT output. Handles the quirks of auto-generated
 * captions: inline <c> styling tags, HTML entities, overlapping cues,
 * missing durations, and duplicate consecutive lines.
 */
/* ---------------------------- fetching ---------------------------- */
export async function fetchCaptionJson3(baseUrl, signal) {
    const url = baseUrl.includes('fmt=')
        ? baseUrl
        : baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'fmt=json3';
    const res = await fetchRetryCaption(url, signal);
    const text = (await res.text()).trim();
    if (!text)
        throw new Error('Caption track is empty');
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error('Caption track is not valid json3');
    }
}
async function fetchRetryCaption(url, signal) {
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Accept: '*/*' },
                signal,
            });
            if (res.ok)
                return res;
            if (res.status >= 500 || res.status === 429)
                throw new Error(`HTTP ${res.status}`);
            throw new HttpCaptionError(`caption fetch → HTTP ${res.status}`);
        }
        catch (e) {
            if (signal?.aborted)
                throw signal.reason ?? e;
            if (e instanceof HttpCaptionError)
                throw e;
            lastErr = e;
        }
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
    throw lastErr instanceof Error ? lastErr : new Error('caption fetch failed');
}
class HttpCaptionError extends Error {
}
/* ---------------------------- parsing ----------------------------- */
const HTML_ENTITIES = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
};
export function decodeEntities(s) {
    return s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => HTML_ENTITIES[m] ?? m);
}
/** Strip YouTube inline markup (<c>, <font>, \n inside segments, zero-width chars) */
export function cleanCueText(s) {
    return decodeEntities(s
        .replace(/<[^>]+>/g, '')
        .replace(/\u200b/g, '')
        .replace(/[ \t]+/g, ' '))
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join('\n');
}
/** Convert json3 to cleaned cues sorted by start time. */
export function json3ToCues(json3) {
    const events = (json3.events ?? [])
        .filter((e) => typeof e.tStartMs === 'number')
        .slice()
        .sort((a, b) => (a.tStartMs ?? 0) - (b.tStartMs ?? 0));
    const cues = [];
    for (const e of events) {
        const text = cleanCueText((e.segs ?? []).map((s) => s.utf8).join(''));
        if (!text)
            continue;
        const start = e.tStartMs ?? 0;
        let duration = e.dDurationMs;
        if (duration === undefined || duration <= 0) {
            // Auto-generated tracks often omit durations — derive from word offsets
            const segs = e.segs ?? [];
            const lastOffset = segs.length
                ? Math.max(...segs.map((s) => s.tOffsetMs ?? 0))
                : 0;
            const lastWordLen = segs.length ? (segs[segs.length - 1]?.utf8?.length ?? 0) * 70 : 0;
            duration = Math.max(600, lastOffset + lastWordLen);
        }
        cues.push({ startMs: start, endMs: start + duration, text });
    }
    // De-duplicate consecutive identical lines (ASR repeats) and clip overlaps
    const out = [];
    for (const c of cues) {
        const prev = out[out.length - 1];
        if (prev && prev.text === c.text && c.startMs - prev.endMs < 400) {
            prev.endMs = Math.max(prev.endMs, c.endMs);
            continue;
        }
        if (prev && c.startMs < prev.endMs) {
            // Slight overlap → clip previous cue
            prev.endMs = Math.max(prev.startMs + 300, c.startMs - 40);
        }
        out.push(c);
    }
    // Cap absurd durations (happens with ASR trailing cues)
    for (const c of out) {
        if (c.endMs - c.startMs > 12_000)
            c.endMs = c.startMs + 6_000;
    }
    return out;
}
/* ---------------------------- rendering --------------------------- */
function pad(n, len = 2) {
    return String(n).padStart(len, '0');
}
export function msToSrtTime(ms) {
    ms = Math.max(0, Math.round(ms));
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const milli = ms % 1000;
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milli, 3)}`;
}
export function msToVttTime(ms) {
    return msToSrtTime(ms).replace(',', '.');
}
export function cuesToSrt(cues) {
    const blocks = cues.map((c, i) => {
        return `${i + 1}\n${msToSrtTime(c.startMs)} --> ${msToSrtTime(c.endMs)}\n${c.text}`;
    });
    return blocks.join('\n\n') + '\n';
}
export function cuesToVtt(cues) {
    const blocks = cues.map((c) => `${msToVttTime(c.startMs)} --> ${msToVttTime(c.endMs)}\n${c.text}`);
    return `WEBVTT\n\n${blocks.join('\n\n')}\n`;
}
/** Full pipeline: caption baseUrl → subtitle file content */
export async function downloadCaption(baseUrl, format, signal) {
    const json3 = await fetchCaptionJson3(baseUrl, signal);
    const cues = json3ToCues(json3);
    if (!cues.length)
        throw new Error('No cues found in caption track');
    return { content: format === 'srt' ? cuesToSrt(cues) : cuesToVtt(cues), cueCount: cues.length };
}
