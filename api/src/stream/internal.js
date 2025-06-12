import { request } from "undici";
import { Readable } from "node:stream";
import { closeRequest, getHeaders, pipe } from "./shared.js";
import { handleHlsPlaylist, isHlsResponse, probeInternalHLSTunnel } from "./internal-hls.js";

const CHUNK_SIZE = BigInt(8e6); // 8 MB
const min = (a, b) => a < b ? a : b;

async function* readChunks(streamInfo, size) {
    let read = 0n, chunksSinceTransplant = 0;    console.log(`[readChunks] Starting chunk download - Total size: ${size}, URL: ${streamInfo.url}`);
    console.log(`======> [readChunks] YouTube chunk download with authentication started`);
    
    while (read < size) {
        if (streamInfo.controller.signal.aborted) {
            console.log(`[readChunks] Controller aborted at read=${read}/${size}`);
            throw new Error("controller aborted");
        }

        const rangeStart = read;
        const rangeEnd = read + CHUNK_SIZE;
        console.log(`[readChunks] Requesting chunk: bytes=${rangeStart}-${rangeEnd}, read=${read}/${size}`);

        const headers = {
            ...getHeaders('youtube'),
            Range: `bytes=${read}-${read + CHUNK_SIZE}`
        };
        console.log(`======> [readChunks] Chunk request using authenticated headers: ${!!headers.Cookie}`);

        const chunk = await request(streamInfo.url, {
            headers,
            dispatcher: streamInfo.dispatcher,
            signal: streamInfo.controller.signal,
            maxRedirections: 4
        });

        console.log(`[readChunks] Chunk response: status=${chunk.statusCode}, content-length=${chunk.headers['content-length']}`);
        console.log(`======> [readChunks] Authenticated chunk request result: status=${chunk.statusCode}`);
        
        if (chunk.statusCode === 403 && chunksSinceTransplant >= 3 && streamInfo.originalRequest) {
            chunksSinceTransplant = 0;
            console.log(`[readChunks] 403 error after 3+ chunks, attempting fresh YouTube API call`);
            console.log(`======> [readChunks] 403 error detected, attempting fresh authenticated API call`);
            try {
                // Import YouTube service dynamically
                const handler = await import(`../processing/services/youtube.js`);
                console.log(`[readChunks] Calling YouTube service for fresh URLs`);
                
                const response = await handler.default({
                    ...streamInfo.originalRequest,
                    dispatcher: streamInfo.dispatcher
                });

                console.log(`[readChunks] Fresh API response:`, {
                    hasUrls: !!response.urls,
                    urlsLength: response.urls ? [response.urls].flat().length : 0,
                    error: response.error,
                    type: response.type
                });
                console.log(`======> [readChunks] Fresh authenticated API call result:`, { hasUrls: !!response.urls, error: response.error });

                if (response.urls) {
                    response.urls = [response.urls].flat();
                    
                    // Update the URL for this stream based on audio/video selection
                    if (streamInfo.originalRequest.isAudioOnly && response.urls.length > 1) {
                        streamInfo.url = response.urls[1];
                        console.log(`[readChunks] Updated to fresh audio URL`);
                    } else if (streamInfo.originalRequest.isAudioMuted) {
                        streamInfo.url = response.urls[0];
                        console.log(`[readChunks] Updated to fresh video URL`);
                    } else {
                        // For video streams, use the first URL
                        streamInfo.url = response.urls[0];
                        console.log(`[readChunks] Updated to fresh video URL`);
                    }
                    
                    console.log(`[readChunks] Fresh URL obtained, retrying chunk request`);
                    continue; // Retry with fresh URL
                } else {
                    console.log(`[readChunks] Fresh API call failed, falling back to transplant`);
                    if (streamInfo.transplant) {
                        await streamInfo.transplant(streamInfo.dispatcher);
                        console.log(`[readChunks] Transplant successful, retrying`);
                        continue;
                    }
                }
            } catch (error) {
                console.log(`[readChunks] Fresh API call failed:`, error);
                // Fallback to transplant
                if (streamInfo.transplant) {
                    try {
                        await streamInfo.transplant(streamInfo.dispatcher);
                        console.log(`[readChunks] Transplant successful, retrying`);
                        continue;
                    } catch (transplantError) {
                        console.log(`[readChunks] Both fresh API and transplant failed:`, transplantError);
                    }
                }
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
    console.log(`======> [handleYoutubeStream] YouTube stream processing initiated with authentication`);

    try {
        let req, attempts = 3;
        console.log(`[handleYoutubeStream] Starting HEAD request with ${attempts} attempts`);
        console.log(`======> [handleYoutubeStream] Using authenticated headers for HEAD request`);
        
        while (attempts--) {
            const headers = getHeaders('youtube');
            console.log(`======> [handleYoutubeStream] HEAD request headers prepared with auth: ${!!headers.Cookie}`);
            
            req = await fetch(streamInfo.url, {
                headers,
                method: 'HEAD',
                dispatcher: streamInfo.dispatcher,
                signal
            });

            console.log(`[handleYoutubeStream] HEAD response: status=${req.status}, url=${req.url}`);
            console.log(`======> [handleYoutubeStream] Authenticated HEAD request completed: status=${req.status}`);
            
            streamInfo.url = req.url;if (req.status === 403 && streamInfo.originalRequest && attempts > 0) {
                console.log(`[handleYoutubeStream] Got 403, attempting fresh YouTube API call (attempts left: ${attempts})`);
                try {
                    // Import YouTube service dynamically
                    const handler = await import(`../processing/services/youtube.js`);
                    console.log(`[handleYoutubeStream] Calling YouTube service for fresh URLs`);
                    
                    const response = await handler.default({
                        ...streamInfo.originalRequest,
                        dispatcher: streamInfo.dispatcher
                    });

                    console.log(`[handleYoutubeStream] Fresh API response:`, {
                        hasUrls: !!response.urls,
                        urlsLength: response.urls ? [response.urls].flat().length : 0,
                        error: response.error,
                        type: response.type
                    });

                    if (response.urls) {
                        response.urls = [response.urls].flat();
                        
                        // Update the URL for this stream based on audio/video selection
                        if (streamInfo.originalRequest.isAudioOnly && response.urls.length > 1) {
                            streamInfo.url = response.urls[1];
                            console.log(`[handleYoutubeStream] Updated to fresh audio URL`);
                        } else if (streamInfo.originalRequest.isAudioMuted) {
                            streamInfo.url = response.urls[0];
                            console.log(`[handleYoutubeStream] Updated to fresh video URL`);
                        } else {
                            // For video streams, use the first URL
                            streamInfo.url = response.urls[0];
                            console.log(`[handleYoutubeStream] Updated to fresh video URL`);
                        }
                        
                        console.log(`[handleYoutubeStream] Fresh URL obtained, retrying HEAD request`);
                        continue; // Retry with fresh URL
                    } else {
                        console.log(`[handleYoutubeStream] Fresh API call failed, falling back to transplant`);
                        if (streamInfo.transplant) {
                            await streamInfo.transplant(streamInfo.dispatcher);
                            console.log(`[handleYoutubeStream] Transplant completed as fallback`);
                        }
                    }
                } catch (error) {
                    console.log(`[handleYoutubeStream] Fresh API call failed:`, error);
                    // Fallback to transplant
                    if (streamInfo.transplant) {
                        try {
                            await streamInfo.transplant(streamInfo.dispatcher);
                            console.log(`[handleYoutubeStream] Transplant completed as fallback`);
                        } catch (transplantError) {
                            console.log(`[handleYoutubeStream] Both fresh API and transplant failed:`, transplantError);
                        }
                    }
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
