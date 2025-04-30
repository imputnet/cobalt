import { OPFSStorage } from "$lib/storage/opfs";

let attempts = 0;

const fetchFile = async (url: string) => {
    const error = async (code: string) => {
        attempts++;

        if (attempts <= 5) {
            // try 5 more times before actually failing

            console.log("fetch attempt", attempts);
            await fetchFile(url);
        } else {
            // if it still fails, then throw an error and quit
            self.postMessage({
                cobaltFetchWorker: {
                    // TODO: return proper error code here
                    // (error.code and not just random shit i typed up)
                    error: code,
                }
            });
            self.close();
        }
    };

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return error("file response wasn't ok");
        }

        const contentType = response.headers.get('Content-Type')
                                || 'application/octet-stream';

        const contentLength = response.headers.get('Content-Length');
        const estimatedLength = response.headers.get('Estimated-Content-Length');

        let totalBytes = null;

        if (contentLength) {
            totalBytes = +contentLength;
        } else if (estimatedLength) {
            totalBytes = +estimatedLength;
        }

        const reader = response.body?.getReader();

        const storage = await OPFSStorage.init();

        if (!reader) {
            return error("no reader");
        }

        let receivedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            await storage.write(value, receivedBytes);
            receivedBytes += value.length;

            if (totalBytes) {
                self.postMessage({
                    cobaltFetchWorker: {
                        progress: Math.round((receivedBytes / totalBytes) * 100),
                        size: receivedBytes,
                    }
                });
            }
        }

        if (receivedBytes === 0) {
            return error("tunnel is broken");
        }

        const file = await storage.res();

        if (contentLength && Number(contentLength) !== file.size) {
            return error("file was not downloaded fully");
        }

        self.postMessage({
            cobaltFetchWorker: {
                result: {
                    file,
                    type: contentType,
                }
            }
        });
    } catch (e) {
        console.log(e);
        return error("error when downloading the file");
    }
}

self.onmessage = async (event: MessageEvent) => {
    if (event.data.cobaltFetchWorker) {
        await fetchFile(event.data.cobaltFetchWorker.url);
        self.close();
    }
}
