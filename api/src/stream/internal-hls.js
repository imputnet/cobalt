import HLS from "hls-parser";
import { createInternalStream } from "./manage.js";
import { request } from "undici";

function getURL(url) {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

function transformObject(streamInfo, hlsObject) {
    if (hlsObject === undefined) {
        return (object) => transformObject(streamInfo, object);
    }

    let fullUrl;
    if (getURL(hlsObject.uri)) {
        fullUrl = new URL(hlsObject.uri);
    } else {
        fullUrl = new URL(hlsObject.uri, streamInfo.url);
    }

    if (fullUrl.hostname !== '127.0.0.1') {
        hlsObject.uri = createInternalStream(fullUrl.toString(), streamInfo);

        if (hlsObject.map) {
            hlsObject.map = transformObject(streamInfo, hlsObject.map);
        }
    }

    return hlsObject;
}

function transformMasterPlaylist(streamInfo, hlsPlaylist) {
    const makeInternalStream = transformObject(streamInfo);

    const makeInternalVariants = (variant) => {
        variant = transformObject(streamInfo, variant);
        variant.video = variant.video.map(makeInternalStream);
        variant.audio = variant.audio.map(makeInternalStream);
        return variant;
    };
    hlsPlaylist.variants = hlsPlaylist.variants.map(makeInternalVariants);

    return hlsPlaylist;
}

function transformMediaPlaylist(streamInfo, hlsPlaylist) {
    const makeInternalSegments = transformObject(streamInfo);
    hlsPlaylist.segments = hlsPlaylist.segments.map(makeInternalSegments);
    hlsPlaylist.prefetchSegments = hlsPlaylist.prefetchSegments.map(makeInternalSegments);
    return hlsPlaylist;
}

const HLS_MIME_TYPES = ["application/vnd.apple.mpegurl", "audio/mpegurl", "application/x-mpegURL"];

export function isHlsResponse(req, streamInfo) {
    return HLS_MIME_TYPES.includes(req.headers['content-type'])
        // bluesky's cdn responds with wrong content-type for the hls playlist,
        // so we enforce it here until they fix it
        || (streamInfo.service === 'bsky' && streamInfo.url.endsWith('.m3u8'));
}

export async function handleHlsPlaylist(streamInfo, req, res) {
    let hlsPlaylist = await req.body.text();
    hlsPlaylist = HLS.parse(hlsPlaylist);

    hlsPlaylist = hlsPlaylist.isMasterPlaylist
        ? transformMasterPlaylist(streamInfo, hlsPlaylist)
        : transformMediaPlaylist(streamInfo, hlsPlaylist);

    hlsPlaylist = HLS.stringify(hlsPlaylist);

    res.send(hlsPlaylist);
}

async function getSegmentSize(url, config) {
    const { body, headers, statusCode } = await request(url, {
        ...config,
        headers: { ...config.headers, range: 'bytes=0-0' }
    });

    if (statusCode === 206) {
        const size = /^bytes 0-0\/(\d+)$/i.exec(headers['content-range'])?.[1];
        // The requested range is one byte. Bound draining even if the origin misbehaves.
        await body.dump({ limit: 2 });
        return Number(size);
    }

    // Origins can ignore Range. Use the full length from the headers if they
    // supply it, and cancel the body even if the length is unknown.
    body.on('error', () => {}).destroy();
    return statusCode === 200 ? Number(headers['content-length']) : NaN;
}

export async function probeInternalHLSTunnel(streamInfo) {
    const { url, headers, dispatcher, signal } = streamInfo;

    // remove all falsy headers
    Object.keys(headers).forEach(key => {
        if (!headers[key]) delete headers[key];
    });

    const config = { headers, dispatcher, signal, maxRedirections: 16 };
    const manifestResponse = await fetch(url, config);
    if (!manifestResponse.ok) {
        await manifestResponse.body?.cancel();
        return -1;
    }

    const manifest = HLS.parse(await manifestResponse.text());
    const segments = manifest.segments.filter(
        segment => segment.uri && segment.duration > 0 && !segment.gap
    );
    const sampleCount = Math.min(5, segments.length);
    const sizeRequests = new Map();
    const samples = await Promise.allSettled(
        Array.from({ length: sampleCount }, async (_, index) => {
            const segment = segments[Math.floor((index + 0.5) * segments.length / sampleCount)];
            let size = segment.byterange?.length;
            if (size === undefined) {
                const segmentUrl = new URL(segment.uri, manifestResponse.url).href;
                if (!sizeRequests.has(segmentUrl)) {
                    sizeRequests.set(segmentUrl, getSegmentSize(segmentUrl, config));
                }
                size = await sizeRequests.get(segmentUrl);
            }
            return { size, duration: segment.duration };
        })
    );

    let sampledBytes = 0, sampledDuration = 0;
    for (const sample of samples) {
        if (sample.status !== 'fulfilled') continue;
        const { size, duration } = sample.value;
        if (!Number.isFinite(size) || size <= 0) continue;
        sampledBytes += size;
        sampledDuration += duration;
    }
    if (!sampledDuration) return -1;

    const totalDuration = segments.reduce((acc, segment) => acc + segment.duration, 0);
    return sampledBytes * (totalDuration / sampledDuration);
}
