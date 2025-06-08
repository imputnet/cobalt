import { request } from "undici";
import { Readable } from "node:stream";
import { closeRequest, getHeaders, pipe } from "./shared.js";
import { handleHlsPlaylist, isHlsResponse, probeInternalHLSTunnel } from "./internal-hls.js";

const CHUNK_SIZE = BigInt(8e6); // 8 MB
const min = (a, b) => a < b ? a : b;

async function* readChunks(streamInfo, size) {
    let read = 0n, chunksSinceTransplant = 0;
    console.log(`[readChunks] Starting chunk download - Total size: ${size}, URL: ${streamInfo.url}`);
    
    while (read < size) {
        if (streamInfo.controller.signal.aborted) {
            console.log(`[readChunks] Controller aborted at read=${read}/${size}`);
            throw new Error("controller aborted");
        }

        const rangeStart = read;
        const rangeEnd = read + CHUNK_SIZE;
        console.log(`[readChunks] Requesting chunk: bytes=${rangeStart}-${rangeEnd}, read=${read}/${size}`);

        const chunk = await request(streamInfo.url, {
            headers: {
                ...getHeaders('youtube'),
                Range: `bytes=${read}-${read + CHUNK_SIZE}`
            },
            dispatcher: streamInfo.dispatcher,
            signal: streamInfo.controller.signal,
            maxRedirections: 4
        });

        console.log(`[readChunks] Chunk response: status=${chunk.statusCode}, content-length=${chunk.headers['content-length']}`);

        if (chunk.statusCode === 403 && chunksSinceTransplant >= 3 && streamInfo.transplant) {
            chunksSinceTransplant = 0;
            console.log(`[readChunks] 403 error after ${chunksSinceTransplant} chunks, attempting transplant`);
            try {
                await streamInfo.transplant(streamInfo.dispatcher);
                console.log(`[readChunks] Transplant successful, retrying`);
                continue;
            } catch (error) {
                console.log(`[readChunks] Transplant failed: ${error}`);
            }
        }

        chunksSinceTransplant++;

        const expected = min(CHUNK_SIZE, size - read);
        const received = BigInt(chunk.headers['content-length']);

        console.log(`[readChunks] Chunk validation: expected=${expected}, received=${received}, threshold=${expected / 2n}`);

        if (received < expected / 2n) {
            console.log(`[readChunks] CRITICAL: Received size (${received}) < expected/2 (${expected / 2n}), closing controller`);
            closeRequest(streamInfo.controller);
        }

        let chunkDataSize = 0;
        for await (const data of chunk.body) {
            chunkDataSize += data.length;
            yield data;
        }

        console.log(`[readChunks] Chunk processed: data size=${chunkDataSize}, header size=${received}, read progress=${read + received}/${size}`);
        read += received;
    }    
    console.log(`[readChunks] Download completed: total read=${read}/${size}`);
}

async function handleYoutubeStream(streamInfo, res) {
    const { signal } = streamInfo.controller;
    const cleanup = () => {
        console.log(`[handleYoutubeStream] Cleanup called`);
        res.end();
        closeRequest(streamInfo.controller);
    };

    console.log(`[handleYoutubeStream] Starting YouTube stream for URL: ${streamInfo.url}`);

    try {
        let req, attempts = 3;
        console.log(`[handleYoutubeStream] Starting HEAD request with ${attempts} attempts`);
        
        while (attempts--) {
            req = await fetch(streamInfo.url, {
                headers: getHeaders('youtube'),
                method: 'HEAD',
                dispatcher: streamInfo.dispatcher,
                signal
            });

            console.log(`[handleYoutubeStream] HEAD response: status=${req.status}, url=${req.url}`);
            
            streamInfo.url = req.url;
            if (req.status === 403 && streamInfo.transplant) {
                console.log(`[handleYoutubeStream] Got 403, attempting transplant`);
                try {
                    await streamInfo.transplant(streamInfo.dispatcher);
                    console.log(`[handleYoutubeStream] Transplant successful`);
                } catch (error) {
                    console.log(`[handleYoutubeStream] Transplant failed: ${error}`);
                    break;
                }
            } else break;
        }

        const size = BigInt(req.headers.get('content-length'));
        console.log(`[handleYoutubeStream] Content length: ${size}, status: ${req.status}`);

        if (req.status !== 200 || !size) {
            console.log(`[handleYoutubeStream] Invalid response - status: ${req.status}, size: ${size}, calling cleanup`);
            return cleanup();
        }

        console.log(`[handleYoutubeStream] Creating generator for size: ${size}`);
        const generator = readChunks(streamInfo, size);

        const abortGenerator = () => {
            console.log(`[handleYoutubeStream] Abort generator called`);
            generator.return();
            signal.removeEventListener('abort', abortGenerator);
        }

        signal.addEventListener('abort', abortGenerator);

        const stream = Readable.from(generator);
        console.log(`[handleYoutubeStream] Created readable stream`);

        // Set response headers
        for (const headerName of ['content-type', 'content-length']) {
            const headerValue = req.headers.get(headerName);
            if (headerValue) {
                res.setHeader(headerName, headerValue);
                console.log(`[handleYoutubeStream] Set header ${headerName}: ${headerValue}`);
            }
        }

        console.log(`[handleYoutubeStream] Starting pipe operation`);
        pipe(stream, res, cleanup);
    } catch (error) {
        console.log(`[handleYoutubeStream] Error occurred: ${error}`);
        cleanup();
    }
}

async function handleGenericStream(streamInfo, res) {
    const { signal } = streamInfo.controller;
    const cleanup = () => res.end();

    try {
        const fileResponse = await request(streamInfo.url, {
            headers: {
                ...Object.fromEntries(streamInfo.headers),
                host: undefined
            },
            dispatcher: streamInfo.dispatcher,
            signal,
            maxRedirections: 16
        });

        res.status(fileResponse.statusCode);
        fileResponse.body.on('error', () => {});

        const isHls = isHlsResponse(fileResponse, streamInfo);

        for (const [ name, value ] of Object.entries(fileResponse.headers)) {
            if (!isHls || name.toLowerCase() !== 'content-length') {
                res.setHeader(name, value);
            }
        }

        if (fileResponse.statusCode < 200 || fileResponse.statusCode > 299) {
            return cleanup();
        }

        if (isHls) {
            await handleHlsPlaylist(streamInfo, fileResponse, res);
        } else {
            pipe(fileResponse.body, res, cleanup);
        }
    } catch {
        closeRequest(streamInfo.controller);
        cleanup();
    }
}

export function internalStream(streamInfo, res) {
    console.log(`[internalStream] Starting stream - service: ${streamInfo.service}, isHLS: ${streamInfo.isHLS}, URL: ${streamInfo.url}`);
    
    if (streamInfo.headers) {
        streamInfo.headers.delete('icy-metadata');
    }

    if (streamInfo.service === 'youtube' && !streamInfo.isHLS) {
        console.log(`[internalStream] Routing to handleYoutubeStream`);
        return handleYoutubeStream(streamInfo, res);
    }

    console.log(`[internalStream] Routing to handleGenericStream`);
    return handleGenericStream(streamInfo, res);
}

export async function probeInternalTunnel(streamInfo) {
    try {
        const signal = AbortSignal.timeout(3000);
        const headers = {
            ...Object.fromEntries(streamInfo.headers || []),
            ...getHeaders(streamInfo.service),
            host: undefined,
            range: undefined
        };

        if (streamInfo.isHLS) {
            return probeInternalHLSTunnel({
                ...streamInfo,
                signal,
                headers
            });
        }

        const response = await request(streamInfo.url, {
            method: 'HEAD',
            headers,
            dispatcher: streamInfo.dispatcher,
            signal,
            maxRedirections: 16
        });

        if (response.statusCode !== 200)
            throw "status is not 200 OK";

        const size = +response.headers['content-length'];
        if (isNaN(size))
            throw "content-length is not a number";

        return size;
    } catch {}
}
