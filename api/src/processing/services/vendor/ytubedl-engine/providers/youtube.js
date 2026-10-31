import { readFileSync } from 'node:fs';
const ORIGIN = 'https://www.youtube.com';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15,gzip(gfe)';
const CLIENTS = [
    {
        key: 'visionos',
        name: 'VISIONOS',
        nameId: 101,
        version: '1.02',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
        context: { deviceMake: 'Apple', deviceModel: 'RealityDevice17,1', osName: 'visionOS', osVersion: '26.5.23O471' },
        needsPlayer: false,
    },
    {
        key: 'ios',
        name: 'IOS',
        nameId: 5,
        version: '20.10.4',
        userAgent: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X; en_US)',
        context: { deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82' },
        needsPlayer: false,
    },
    {
        key: 'android',
        name: 'ANDROID',
        nameId: 3,
        version: '20.10.38',
        userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
        context: { androidSdkVersion: 30, osName: 'Android', osVersion: '11' },
        needsPlayer: true,
    },
    {
        key: 'tv',
        name: 'TVHTML5',
        nameId: 7,
        version: '5.20260707',
        userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/2.4.0 TV Safari/538.1',
        context: { deviceMake: 'Samsung', deviceModel: 'UKS9800', osName: 'Tizen', osVersion: '2.4.0' },
        needsPlayer: true,
    },
    {
        key: 'web_embedded',
        name: 'WEB_EMBEDDED_PLAYER',
        nameId: 56,
        version: '2.20260708.00.00',
        userAgent: SAFARI_UA,
        needsPlayer: true,
        embed: true,
    },
    {
        key: 'mweb',
        name: 'MWEB',
        nameId: 2,
        version: '2.20260708.05.00',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_7_10 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1,gzip(gfe)',
        needsPlayer: true,
    },
    {
        key: 'web',
        name: 'WEB',
        nameId: 1,
        version: '2.20260708.00.00',
        userAgent: CHROME_UA,
        needsPlayer: true,
    },
];
/* ------------------------- shared session state ------------------------ */
let visitorDataCache = null;
let stsCache = null;
let cookieHeaderCache = null;
async function fetchText(url, headers, timeoutMs = 15_000, signal, fetchImpl) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    signal?.addEventListener('abort', () => ac.abort(), { once: true });
    try {
        const res = await (fetchImpl ?? fetch)(url, { headers, signal: ac.signal });
        if (!res.ok)
            throw new Error(`HTTP ${res.status} for ${url}`);
        return await res.text();
    }
    finally {
        clearTimeout(t);
    }
}
async function getVisitorData(signal, fetchImpl) {
    if (visitorDataCache && Date.now() - visitorDataCache.at < 30 * 60_000) {
        return visitorDataCache.value;
    }
    try {
        const body = await fetchText(`${ORIGIN}/sw.js_data`, { 'User-Agent': CHROME_UA }, 15_000, signal, fetchImpl);
        const parsed = JSON.parse(body.replace(/^\)\]\}'\s*/u, ''));
        const visitor = parsed?.[0]?.[2]?.[0]?.[0]?.[13];
        if (typeof visitor === 'string' && visitor) {
            visitorDataCache = { value: visitor, at: Date.now() };
            return visitor;
        }
    }
    catch {
        /* non-fatal */
    }
    return undefined;
}
async function getSignatureTimestamp(signal, fetchImpl) {
    if (stsCache && Date.now() - stsCache.at < 10 * 60_000)
        return stsCache.value;
    try {
        const api = await fetchText(`${ORIGIN}/iframe_api`, { 'User-Agent': CHROME_UA }, 15_000, signal, fetchImpl);
        const pid = /player\\?\/([\da-f]{8})\\?\//u.exec(api)?.[1];
        if (!pid)
            return undefined;
        const js = await fetchText(`${ORIGIN}/s/player/${pid}/player_ias.vflset/en_US/base.js`, { 'User-Agent': CHROME_UA }, 25_000, signal, fetchImpl);
        const sts = /signatureTimestamp:(\d+)/u.exec(js)?.[1];
        if (sts) {
            stsCache = { value: Number(sts), at: Date.now() };
            return Number(sts);
        }
    }
    catch {
        /* non-fatal — clients that don't need the player still work */
    }
    return undefined;
}
/** Netscape cookies.txt → Cookie header (opt-in via YTUBEDL_COOKIES env; legacy names still read). */
function getCookieHeader() {
    const path = process.env.YTUBEDL_COOKIES
        ?? process.env.YTUBEDL_COOKIES
        ?? process.env.YTBEDL_COOKIES;
    if (!path)
        return undefined;
    if (cookieHeaderCache && Date.now() - cookieHeaderCache.at < 5 * 60_000) {
        return cookieHeaderCache.value;
    }
    try {
        const text = readFileSync(path, 'utf8');
        const parts = [];
        for (const line of text.split('\n')) {
            const l = line.trim();
            if (!l || l.startsWith('#'))
                continue;
            const cols = l.split('\t');
            if (cols.length >= 7 && /(^|\.)youtube\.com$/i.test(cols[0])) {
                parts.push(`${cols[5]}=${cols[6]}`);
            }
        }
        if (parts.length) {
            cookieHeaderCache = { value: parts.join('; '), at: Date.now() };
            return cookieHeaderCache.value;
        }
    }
    catch {
        /* ignore bad cookie file */
    }
    return undefined;
}
async function loadEmbedContext(videoId, signal, fetchImpl, cookieHeader) {
    try {
        const html = await fetchText(`${ORIGIN}/embed/${encodeURIComponent(videoId)}?html5=1`, {
            'User-Agent': SAFARI_UA,
            Referer: 'https://www.reddit.com/',
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        }, 15_000, signal, fetchImpl);
        const cfg = /ytcfg\.set\(\{.*?\}\)/s.exec(html)?.[0];
        const visitor = cfg ? /"VISITOR_DATA":"([^"]+)"/.exec(cfg)?.[1] : undefined;
        const flags = cfg
            ? /"WEB_PLAYER_CONTEXT_CONFIGS":\{.*?"encryptedHostFlags":"([^"]*)"/s.exec(cfg)?.[1]
            : undefined;
        return {
            visitorData: visitor?.replace(/\\u0026/g, '&').replace(/\\"/g, '"'),
            hostFlags: flags,
        };
    }
    catch {
        return {};
    }
}
async function playerRequest(client, videoId, opts = {}) {
    const body = {
        videoId,
        contentCheckOk: true,
        racyCheckOk: true,
    };
    const clientCtx = {
        clientName: client.name,
        clientVersion: client.version,
        ...client.context,
        userAgent: client.userAgent,
        hl: 'en',
        gl: 'US',
        utcOffsetMinutes: 0,
    };
    const visitor = opts.embed?.visitorData ?? opts.visitorData;
    if (visitor)
        clientCtx.visitorData = visitor;
    body.context = {
        client: clientCtx,
        ...(client.embed ? { thirdParty: { embedUrl: 'https://www.reddit.com/' } } : {}),
    };
    body.playbackContext = {
        contentPlaybackContext: {
            html5Preference: 'HTML5_PREF_WANTS',
            ...(opts.sts !== undefined ? { signatureTimestamp: opts.sts } : {}),
            ...(client.embed && opts.embed?.hostFlags ? { encryptedHostFlags: opts.embed.hostFlags } : {}),
        },
    };
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': client.userAgent,
        'X-YouTube-Client-Name': String(client.nameId),
        'X-YouTube-Client-Version': client.version,
        Origin: ORIGIN,
        'Accept-Language': 'en-US,en;q=0.9',
    };
    // per-request cookies (cobalt) take precedence over the YTUBEDL_COOKIES file
    const cookies = opts.cookieHeader ?? getCookieHeader();
    if (cookies) {
        headers.Cookie = cookies;
        headers.Referer = `${ORIGIN}/`;
    }
    if (visitor)
        headers['X-Goog-Visitor-Id'] = visitor;
    const res = await (opts.fetch ?? fetch)(`${ORIGIN}/youtubei/v1/player?prettyPrint=false`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: opts.signal,
    });
    if (!res.ok)
        throw new Error(`${client.name} player → HTTP ${res.status}`);
    return await res.json();
}
/* --------------------------- format mapping --------------------------- */
const ITAG_LABELS = {
    17: '144p', 36: '240p', 18: '360p', 22: '720p',
    160: '144p', 133: '240p', 134: '360p', 135: '480p', 136: '720p', 137: '1080p',
    298: '720p60', 299: '1080p60', 308: '1440p60', 315: '2160p60',
    278: '144p', 242: '240p', 243: '360p', 244: '480p', 247: '720p', 248: '1080p',
    271: '1440p', 313: '2160p', 272: '4320p',
    302: '720p60', 303: '1080p60',
    394: '144p', 395: '240p', 396: '360p', 397: '480p', 398: '720p',
    399: '1080p', 400: '1440p', 401: '2160p', 402: '4320p',
};
function parseMime(mimeType) {
    const [type, ...params] = mimeType.split(';');
    const codecsRaw = params.find((p) => p.trim().startsWith('codecs='));
    const codecs = codecsRaw
        ? (codecsRaw.replace(/.*codecs="?([^"]*)"?/, '$1') ?? '').split(',').map((c) => c.trim())
        : [];
    const container = type.split('/')[1]?.trim() ?? '';
    return { container, codecs };
}
function codecFamily(codec) {
    if (codec.startsWith('avc1') || codec.startsWith('avc3'))
        return 'h264';
    if (codec.startsWith('vp9') || codec.startsWith('vp8'))
        return 'vp9';
    if (codec.startsWith('av01'))
        return 'av1';
    return 'other';
}
/** Normalize the raw InnerTube audioTrack object (keys differ slightly per client). */
function mapAudioTrack(raw) {
    if (!raw || typeof raw !== 'object')
        return undefined;
    const track = {
        id: raw.audioTrackId ?? raw.id,
        name: raw.audioTrackName ?? raw.displayName,
        isDefault: raw.audioIsDefault ?? raw.isDefault,
    };
    return track.id !== undefined || track.name !== undefined ? track : undefined;
}
function mapFormats(raw) {
    const videos = [];
    const audios = [];
    const urls = new Map();
    let ciphered = 0;
    let drm = 0;
    for (const f of raw) {
        if (!f || typeof f.itag !== 'number')
            continue;
        // DRM (widevine) streams can't be decrypted downstream; never advertise them
        if (Array.isArray(f.drmFamilies) && f.drmFamilies.length) {
            drm++;
            continue;
        }
        const mime = String(f.mimeType ?? f.mime_type ?? '');
        const { container, codecs } = parseMime(mime);
        const isAudio = mime.startsWith('audio/');
        const videoCodec = codecs.find((c) => !isAudio && !/mp4a|opus|vorbis|ac-3|ec-3|mha1/.test(c));
        const audioCodec = codecs.find((c) => /mp4a|opus|vorbis|ac-3|ec-3|mha1/.test(c));
        // Resolve a direct URL (skip ciphered — see file docs)
        let url;
        if (typeof f.url === 'string' && f.url) {
            url = f.url;
        }
        else if (f.signatureCipher || f.cipher) {
            ciphered++;
        }
        // multi-track audio reuses itags across languages: prefer the default
        // (original) track's URL so itag-keyed lookups get the intended language
        const isDefaultTrack = f.audioTrack?.audioIsDefault === true
            || f.audioTrack?.isDefault === true;
        if (url && (!urls.has(f.itag) || isDefaultTrack)) {
            urls.set(f.itag, url);
        }
        const clen = Number(f.contentLength ?? 0) || undefined;
        const bitrate = Number(f.bitrate ?? 0);
        if (isAudio || (!videoCodec && audioCodec)) {
            const codec = audioCodec?.startsWith('opus')
                ? 'opus'
                : audioCodec?.startsWith('vorbis')
                    ? 'opus'
                    : 'aac';
            const audioTrack = mapAudioTrack(f.audioTrack);
            audios.push({
                itag: f.itag,
                codec,
                container: container.includes('webm') ? 'webm' : 'm4a',
                bitrate,
                sizeBytes: clen,
                sampleRate: Number(f.audioSampleRate) || undefined,
                channels: f.audioChannels ? Math.round(f.audioChannels) : undefined,
                ...(audioTrack ? { audioTrack } : {}),
                ...(url ? { url } : {}),
            });
        }
        else if (videoCodec) {
            const h = Number(f.height ?? 0) || undefined;
            const fps = Number(f.fps ?? 0) || undefined;
            const label = (typeof f.qualityLabel === 'string' && f.qualityLabel) ||
                ITAG_LABELS[f.itag] ||
                (h ? `${h}p${fps && fps > 30 ? fps : ''}` : `itag-${f.itag}`);
            videos.push({
                itag: f.itag,
                label,
                width: Number(f.width ?? 0) || undefined,
                height: h,
                fps,
                codec: videoCodec,
                codecFamily: codecFamily(videoCodec),
                container: container.includes('webm') ? 'webm' : 'mp4',
                bitrate,
                sizeBytes: clen,
                hdr: /bt2020|smpte2084/i.test(String(f.colorInfo?.primaries ?? '') + String(f.projectionType ?? '')),
                hasAudio: !!audioCodec,
                ...(url ? { url } : {}),
            });
        }
    }
    videos.sort((a, b) => (b.height ?? 0) - (a.height ?? 0) || (b.fps ?? 0) - (a.fps ?? 0) || b.bitrate - a.bitrate);
    audios.sort((a, b) => b.bitrate - a.bitrate);
    return { videos, audios, urls, ciphered, drm };
}
/* ------------------------------ provider ------------------------------ */
export class YouTubeProvider {
    name = 'youtube';
    async probe(url, opts = {}) {
        const videoId = /(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/.exec(url)?.[1]
            ?? (/^([A-Za-z0-9_-]{11})$/.exec(url.trim())?.[1] ?? '');
        if (!videoId)
            throw new Error('Could not extract a YouTube video id');
        const visitor = await getVisitorData(opts.signal, opts.fetch);
        let sts; // fetched lazily — first clients need no player
        const failures = [];
        for (const client of CLIENTS) {
            if (opts.signal?.aborted)
                throw new Error('aborted');
            let embedCtx;
            if (client.embed)
                embedCtx = await loadEmbedContext(videoId, opts.signal, opts.fetch, opts.cookieHeader);
            let data;
            try {
                if (client.needsPlayer && sts === undefined) {
                    sts = await getSignatureTimestamp(opts.signal, opts.fetch);
                }
                data = await playerRequest(client, videoId, {
                    signal: opts.signal,
                    cookieHeader: opts.cookieHeader,
                    fetch: opts.fetch,
                    visitorData: visitor,
                    sts: client.needsPlayer ? sts : undefined,
                    embed: embedCtx,
                });
            }
            catch (e) {
                failures.push(`${client.name}: ${e instanceof Error ? e.message : String(e)}`);
                continue;
            }
            const playability = data?.playabilityStatus?.status;
            if (playability !== 'OK') {
                const reason = data?.playabilityStatus?.reason ??
                    data?.playabilityStatus?.errorScreen?.playerErrorMessageRenderer?.reason?.simpleText ??
                    playability ??
                    'unknown';
                failures.push(`${client.name}: ${reason}`);
                continue;
            }
            const streaming = data?.streamingData;
            const rawFormats = [
                ...(streaming?.formats ?? []),
                ...(streaming?.adaptiveFormats ?? []),
            ];
            const { videos, audios, urls, ciphered, drm } = mapFormats(rawFormats);
            // WEB family responses are SABR-only → treat "no urls at all" as failure
            if (!urls.size) {
                failures.push(`${client.name}: no direct stream URLs${ciphered ? ` (${ciphered} ciphered)` : ''}${drm ? ` (${drm} DRM)` : ''}`);
                continue;
            }
            const details = data?.videoDetails ?? {};
            const micro = data?.microformat?.playerMicroformatRenderer ?? {};
            const captionsRaw = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
            const subtitleTracks = [];
            const captions = new Map();
            for (const ct of captionsRaw) {
                if (!ct?.baseUrl)
                    continue;
                const lang = String(ct.languageCode ?? '??');
                const auto = ct.kind === 'asr';
                const id = auto ? `${lang}-auto` : lang;
                const name = ct.name?.simpleText ??
                    ct.name?.runs?.[0]?.text ??
                    (auto ? `${lang} (auto)` : lang);
                subtitleTracks.push({ id, languageCode: lang, name, auto });
                captions.set(id, String(ct.baseUrl));
            }
            const streams = new Map();
            for (const [itag, u] of urls) {
                const raw = rawFormats.find((f) => f.itag === itag);
                streams.set(itag, {
                    url: u,
                    sizeBytes: Number(raw?.contentLength ?? 0) || undefined,
                    headers: { 'User-Agent': client.userAgent },
                });
            }
            const qualities = [...new Set(videos.map((v) => v.label))];
            const media = {
                id: videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                title: String(details.title ?? micro.title?.simpleText ?? `YouTube video ${videoId}`),
                author: String(details.author ?? micro.ownerChannelName ?? '') || undefined,
                description: typeof details.shortDescription === 'string' && details.shortDescription
                    ? details.shortDescription
                    : undefined,
                durationSec: Number(details.lengthSeconds) || Number(micro.lengthSeconds) || undefined,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                viewCount: Number(details.viewCount) || undefined,
                isLive: details.isLiveContent === true && details.lengthSeconds === undefined,
                hlsManifestUrl: typeof streaming?.hlsManifestUrl === 'string' ? streaming.hlsManifestUrl : undefined,
                videoFormats: videos,
                audioFormats: audios,
                subtitleTracks,
                qualities,
                source: 'youtube',
            };
            return { media, streams, captions, failures };
        }
        // All clients failed → metadata-only fallback so the UI can still render
        if (opts.signal?.aborted)
            throw new Error('aborted');
        const meta = await oEmbedMetadata(videoId, opts.signal, opts.fetch);
        // "Sign in to confirm your age" must NOT match here — only literal bot checks
        const botCheck = failures.some((f) => /not a bot/i.test(f));
        const note = botCheck
            ? 'YouTube is blocking this server\'s IP ("confirm you\'re not a bot"). Metadata resolved via oEmbed. Run the engine from a residential IP or set YTUBEDL_COOKIES to a signed-in cookies.txt to download.'
            : `No playable formats: ${failures.slice(0, 2).join(' · ')}`;
        if (meta) {
            const media = {
                id: videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                title: meta.title,
                author: meta.author,
                durationSec: undefined,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                isLive: false,
                videoFormats: [],
                audioFormats: [],
                subtitleTracks: [],
                qualities: [],
                source: 'youtube',
                note,
            };
            return { media, streams: new Map(), captions: new Map(), failures };
        }
        const err = new Error(note);
        err.failures = failures;
        throw err;
    }
}
async function oEmbedMetadata(videoId, signal, fetchImpl) {
    try {
        const res = await (fetchImpl ?? fetch)(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, { headers: { 'User-Agent': CHROME_UA }, signal });
        if (!res.ok)
            return null;
        const j = await res.json();
        if (typeof j?.title === 'string')
            return { title: j.title, author: j.author_name };
    }
    catch {
        /* ignore */
    }
    return null;
}
export async function youtubePlaylist(playlistId, signal) {
    const visitor = await getVisitorData();
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': CHROME_UA,
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20260708.00.00',
        Origin: ORIGIN,
    };
    if (visitor)
        headers['X-Goog-Visitor-Id'] = visitor;
    const cookies = getCookieHeader();
    if (cookies)
        headers.Cookie = cookies;
    const res = await fetch(`${ORIGIN}/youtubei/v1/browse?prettyPrint=false`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            context: {
                client: {
                    clientName: 'WEB',
                    clientVersion: '2.20260708.00.00',
                    userAgent: CHROME_UA,
                    hl: 'en',
                    gl: 'US',
                    ...(visitor ? { visitorData: visitor } : {}),
                },
            },
            browseId: `VL${playlistId}`,
        }),
        signal,
    });
    if (!res.ok)
        throw new Error(`playlist browse → HTTP ${res.status}`);
    const data = await res.json();
    const videos = [];
    const walk = (node, depth = 0) => {
        if (!node || typeof node !== 'object' || depth > 12)
            return;
        if (Array.isArray(node)) {
            for (const n of node)
                walk(n, depth + 1);
            return;
        }
        const obj = node;
        const renderer = obj.playlistVideoRenderer;
        if (renderer?.videoId && videos.length < 100) {
            videos.push({
                id: String(renderer.videoId),
                title: renderer.title?.runs?.[0]?.text ??
                    renderer.title?.simpleText ??
                    `Video ${renderer.videoId}`,
                durationSec: parseClock(renderer.lengthText?.simpleText),
                author: renderer.shortBylineText?.runs?.[0]?.text,
            });
        }
        for (const v of Object.values(obj))
            walk(v, depth + 1);
    };
    walk(data?.contents);
    if (!videos.length) {
        throw new Error('Playlist could not be expanded (empty, private, or blocked from this server IP)');
    }
    const title = data?.header?.playlistHeaderRenderer?.title?.simpleText ??
        data?.metadata?.playlistMetadataRenderer?.title ??
        `Playlist ${playlistId}`;
    return { title, videos };
}
function parseClock(s) {
    if (!s)
        return undefined;
    const parts = s.split(':').map(Number);
    if (parts.some(Number.isNaN))
        return undefined;
    return parts.reduce((acc, p) => acc * 60 + p, 0);
}
let healthCache = null;
const HEALTH_TTL = 5 * 60_000;
export async function youtubeHealth(force = false) {
    if (!force && healthCache && Date.now() - healthCache.checkedAt < HEALTH_TTL) {
        return healthCache;
    }
    const started = Date.now();
    try {
        const data = await playerRequest(CLIENTS[0], 'aqz-KE-bpKQ', {});
        const ok = data?.playabilityStatus?.status === 'OK' && (data?.streamingData?.adaptiveFormats?.length ?? 0) > 0;
        healthCache = {
            ok,
            detail: ok
                ? 'YouTube reachable — live downloads enabled'
                : String(data?.playabilityStatus?.reason ?? 'formats unavailable from this IP'),
            latencyMs: Date.now() - started,
            checkedAt: Date.now(),
        };
    }
    catch (e) {
        healthCache = {
            ok: false,
            detail: e instanceof Error ? e.message : String(e),
            latencyMs: Date.now() - started,
            checkedAt: Date.now(),
        };
    }
    return healthCache;
}
export { ITAG_LABELS };
