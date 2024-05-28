import { request } from 'undici';
import { Readable } from 'node:stream';
import { assert } from 'console';
import { createInternalStream } from './manage.js';
import { getHeaders } from './shared.js';
import HLS from 'hls-parser';

const CHUNK_SIZE = BigInt(8e6); // 8 MB
const min = (a, b) => a < b ? a : b;

async function* readChunks(streamInfo, size) {
    let read = 0n;
    while (read < size) {
        if (streamInfo.controller.signal.aborted) {
            throw new Error("controller aborted");
        }

        const chunk = await request(streamInfo.url, {
            headers: {
                ...getHeaders('youtube'),
                Range: `bytes=${read}-${read + CHUNK_SIZE}`
            },
            dispatcher: streamInfo.dispatcher,
            signal: streamInfo.controller.signal
        });

        const expected = min(CHUNK_SIZE, size - read);
        const received = BigInt(chunk.headers['content-length']);

        if (received < expected / 2n) {
            streamInfo.controller.abort();
        }
        
        for await (const data of chunk.body) {
            yield data;
        }

        read += received;
    }
} 

function chunkedStream(streamInfo, size) {
    assert(streamInfo.controller instanceof AbortController);
    const stream = Readable.from(readChunks(streamInfo, size));
    return stream;
}

async function handleYoutubeStream(streamInfo, res) {
    try {
        const req = await fetch(streamInfo.url, {
            headers: getHeaders('youtube'),
            method: 'HEAD',
            dispatcher: streamInfo.dispatcher,
            signal: streamInfo.controller.signal
        });

        streamInfo.url = req.url;
        const size = BigInt(req.headers.get('content-length'));

        if (req.status !== 200 || !size) {
            return res.end();
        }

        const stream = chunkedStream(streamInfo, size);

        for (const headerName of ['content-type', 'content-length']) {
            const headerValue = req.headers.get(headerName);
            if (headerValue) res.setHeader(headerName, headerValue);
        }

        stream.pipe(res);
        stream.on('error', () => res.end());
    } catch {
        res.end();
    }
}

function transformHlsMediaPlaylist(streamInfo, hlsPlaylist) {
    const makeInternalSegments = (segment) => {
        const fullUri = new URL(segment.uri, streamInfo.url).toString();
        segment.uri = createInternalStream(fullUri, streamInfo);

        return segment;
    }

    hlsPlaylist.segments = hlsPlaylist.segments.map(makeInternalSegments);
    hlsPlaylist.prefetchSegments = hlsPlaylist.prefetchSegments.map(makeInternalSegments);

    return hlsPlaylist;
}

async function handleHlsPlaylist(streamInfo, req, res) {
    let hlsPlaylist = await req.body.text();
    hlsPlaylist = HLS.parse(hlsPlaylist);

    // NOTE no processing module is passing the master playlist
    assert(!hlsPlaylist.isMasterPlaylist);

    hlsPlaylist = transformHlsMediaPlaylist(streamInfo, hlsPlaylist);
    hlsPlaylist = HLS.stringify(hlsPlaylist);

    res.write(hlsPlaylist);
    res.end();
}

const HLS_MIME_TYPES = ["application/vnd.apple.mpegurl", "audio/mpegurl", "application/x-mpegURL"];

export async function internalStream(streamInfo, res) {
    if (streamInfo.service === 'youtube') {
        return handleYoutubeStream(streamInfo, res);
    }

    try {
        const req = await request(streamInfo.url, {
            headers: {
                ...streamInfo.headers,
                host: undefined
            },
            dispatcher: streamInfo.dispatcher,
            signal: streamInfo.controller.signal,
            maxRedirections: 16
        });

        res.status(req.statusCode);

        for (const [ name, value ] of Object.entries(req.headers))
            res.setHeader(name, value)

        if (req.statusCode < 200 || req.statusCode > 299)
            return res.end();

        if (HLS_MIME_TYPES.includes(req.headers['content-type'])) {
            await handleHlsPlaylist(streamInfo, req, res);
        } else {
            req.body.pipe(res);
            req.body.on('error', () => res.end());
        }
    } catch {
        streamInfo.controller.abort();
    }
}