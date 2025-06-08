import { request } from "undici";
import { Readable } from "node:stream";
import { closeRequest, getHeaders, pipe } from "./shared.js";
import { handleHlsPlaylist, isHlsResponse, probeInternalHLSTunnel } from "./internal-hls.js";

const CHUNK_SIZE = BigInt(8e6); // 8 MB
const min = (a, b) => a < b ? a : b;

async function* readChunks(streamInfo, size) {
    let read = 0n, chunksSinceTransplant = 0;
    while (read < size) {
        if (streamInfo.controller.signal.aborted) {
            throw new Error("controller aborted");
        }

        let retries = 3;
        let chunk;
        
        // Retry mechanism for failed chunks
        while (retries > 0) {
            try {
                chunk = await request(streamInfo.url, {
                    headers: {
                        ...getHeaders('youtube'),
                        Range: `bytes=${read}-${read + CHUNK_SIZE}`
                    },
                    dispatcher: streamInfo.dispatcher,
                    signal: streamInfo.controller.signal,
                    maxRedirections: 4
                });

                // Check for valid response before processing
                if (chunk.statusCode === 206 || chunk.statusCode === 200) {
                    break; // Success, exit retry loop
                } else if (chunk.statusCode === 403 && chunksSinceTransplant >= 3 && streamInfo.transplant) {
                    chunksSinceTransplant = 0;
                    try {
                        await streamInfo.transplant(streamInfo.dispatcher);
                        continue; // Retry with transplanted connection
                    } catch {}
                }
                
                // For other status codes, retry
                throw new Error(`HTTP ${chunk.statusCode} response`);
                
            } catch (error) {
                retries--;
                if (retries === 0) {
                    throw new Error(`Failed to fetch chunk after 3 attempts: ${error.message}`);
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
            }
        }

        chunksSinceTransplant++;
        
        const expected = min(CHUNK_SIZE, size - read);
        const received = BigInt(chunk.headers['content-length']);

        // Validate we received some data
        if (received === 0n && expected > 0n) {
            throw new Error("Received empty chunk when data was expected");
        }

        for await (const data of chunk.body) {
            yield data;
        }

        read += received;
    }
}

async function handleYoutubeStream(streamInfo, res) {
    const { signal } = streamInfo.controller;
    const cleanup = () => {
        // Only end response if headers haven't been sent to prevent 0-byte files
        if (!res.headersSent) {
            res.end();
        }
        closeRequest(streamInfo.controller);
    };

    try {
        let req, attempts = 3;
        while (attempts--) {
            req = await fetch(streamInfo.url, {
                headers: getHeaders('youtube'),
                method: 'HEAD',
                dispatcher: streamInfo.dispatcher,
                signal
            });

            streamInfo.url = req.url;
            if (req.status === 403 && streamInfo.transplant) {
                try {
                    await streamInfo.transplant(streamInfo.dispatcher);
                } catch {
                    break;
                }
            } else break;
        }

        const size = BigInt(req.headers.get('content-length'));

        if (req.status !== 200 || !size) {
            return cleanup();
        }

        // Check if client sent a Range header for partial content request
        const rangeHeader = streamInfo.headers?.get('range');
        
        if (rangeHeader && req.headers.get('accept-ranges') === 'bytes') {
            // Handle range request - delegate to handleGenericStream for proper range handling
            return await handleGenericStream(streamInfo, res);
        }

        // Set headers before starting stream to ensure they're sent
        for (const headerName of ['content-type', 'content-length', 'accept-ranges']) {
            const headerValue = req.headers.get(headerName);
            if (headerValue) res.setHeader(headerName, headerValue);
        }

        // Full file request - use chunked download approach
        const generator = readChunks(streamInfo, size);

        const abortGenerator = () => {
            generator.return();
            signal.removeEventListener('abort', abortGenerator);
        }

        signal.addEventListener('abort', abortGenerator);

        const stream = Readable.from(generator);

        // Add error handling to prevent 0-byte files
        stream.on('error', (error) => {
            console.error('YouTube stream error:', error);
            if (!res.headersSent) {
                res.status(500).end();
            }
        });

        pipe(stream, res, cleanup);
    } catch (error) {
        console.error('YouTube stream handling error:', error);
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
    if (streamInfo.headers) {
        streamInfo.headers.delete('icy-metadata');
    }

    if (streamInfo.service === 'youtube' && !streamInfo.isHLS) {
        return handleYoutubeStream(streamInfo, res);
    }

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
