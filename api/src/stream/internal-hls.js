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
    const segmentResponse = await request(url, {
        ...config,
        throwOnError: true
    });

    if (segmentResponse.headers['content-length']) {
        segmentResponse.body.dump();
        return +segmentResponse.headers['content-length'];
    }

    // if the response does not have a content-length
    // header, we have to compute it ourselves
    let size = 0;

    for await (const data of segmentResponse.body) {
        size += data.length;
    }

    return size;
}

export async function probeInternalHLSTunnel(streamInfo) {
    const { url, headers, dispatcher, signal } = streamInfo;

    // remove all falsy headers
    Object.keys(headers).forEach(key => {
        if (!headers[key]) delete headers[key];
    });

    const config = { headers, dispatcher, signal, maxRedirections: 16 };

    const manifestResponse = await fetch(url, config);

    const manifest = HLS.parse(await manifestResponse.text());
    if (manifest.segments.length === 0)
        return -1;

    const segmentSamples = await Promise.all(
        Array(5).fill().map(async () => {
            const manifestIdx = Math.floor(Math.random() * manifest.segments.length);
            const randomSegment = manifest.segments[manifestIdx];
            if (!randomSegment.uri)
                throw "segment is missing URI";

            const segmentSize = await getSegmentSize(randomSegment.uri, config) / randomSegment.duration;
            return segmentSize;
        })
    );

    const averageBitrate = segmentSamples.reduce((a, b) => a + b) / segmentSamples.length;
    const totalDuration = manifest.segments.reduce((acc, segment) => acc + segment.duration, 0);

    return averageBitrate * totalDuration;
}
