import { createInternalStream } from "./manage.js";
import { request } from "undici";
import { HlsParser } from "@imput/cobalt-rs-hls";

function getURL(url) {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

const HLS_MIME_TYPES = ["application/vnd.apple.mpegurl", "audio/mpegurl", "application/x-mpegURL"];

export function isHlsResponse(req, streamInfo) {
    return HLS_MIME_TYPES.includes(req.headers['content-type'])
        // bluesky's cdn responds with wrong content-type for the hls playlist,
        // so we enforce it here until they fix it
        || (streamInfo.service === 'bsky' && streamInfo.url.endsWith('.m3u8'));
}

export async function handleHlsPlaylist(streamInfo, req, res) {
    const playlistContent = await req.body.text();

    const parser = new HlsParser(streamInfo.url);
    const result = parser.handleHlsPlaylist(playlistContent, (uri) => {
        return createInternalStream(uri, streamInfo);
    });

    res.send(result);
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
    const manifestText = await manifestResponse.text();

    const parser = new HlsParser(streamInfo.url);
    let segments;
    try {
        segments = parser.getMediaSegments(manifestText);
    } catch {
        return -1;
    }

    if (!segments || segments.length === 0)
        return -1;

    const segmentSamples = await Promise.all(
        Array(5).fill().map(async () => {
            const manifestIdx = Math.floor(Math.random() * segments.length);
            const randomSegment = segments[manifestIdx];
            if (!randomSegment.uri)
                throw "segment is missing URI";

            let segmentUrl;

            if (getURL(randomSegment.uri)) {
                segmentUrl = new URL(randomSegment.uri);
            } else {
                segmentUrl = new URL(randomSegment.uri, streamInfo.url);
            }

            const segmentSize = await getSegmentSize(segmentUrl, config) / randomSegment.duration;
            return segmentSize;
        })
    );

    const averageBitrate = segmentSamples.reduce((a, b) => a + b) / segmentSamples.length;
    const totalDuration = segments.reduce((acc, segment) => acc + segment.duration, 0);

    return averageBitrate * totalDuration;
}
