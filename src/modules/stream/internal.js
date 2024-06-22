import { request } from 'undici';
import { Readable } from 'node:stream';
import { getHeaders, pipe } from './shared.js';
import { handleHlsPlaylist, isHlsRequest } from './internal-hls.js';

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

async function handleYoutubeStream(streamInfo, res) {
    const { signal } = streamInfo.controller;

    try {
        const req = await fetch(streamInfo.url, {
            headers: getHeaders('youtube'),
            method: 'HEAD',
            dispatcher: streamInfo.dispatcher,
            signal
        });

        streamInfo.url = req.url;
        const size = BigInt(req.headers.get('content-length'));

        if (req.status !== 200 || !size) {
            return res.end();
        }

        const generator = readChunks(streamInfo, size);

        const abortGenerator = () => {
            generator.return();
            signal.removeEventListener('abort', abortGenerator);
        }

        signal.addEventListener('abort', abortGenerator);
    
        const stream = Readable.from(generator);

        for (const headerName of ['content-type', 'content-length']) {
            const headerValue = req.headers.get(headerName);
            if (headerValue) res.setHeader(headerName, headerValue);
        }

        pipe(stream, res, () => res.end());
    } catch {
        signal.abort();
        res.end();
    }
}

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

        if (isHlsRequest(req)) {
            await handleHlsPlaylist(streamInfo, req, res);
        } else {
            pipe(req.body, res, () => res.end());
        }
    } catch {
        streamInfo.controller.abort();
    }
}