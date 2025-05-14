import * as Storage from "$lib/storage";

let attempts = 0;

const fetchFile = async (url: string) => {
    const error = async (code: string) => {
        attempts++;

        if (attempts <= 5) {
            // try 5 more times before actually failing
            await fetchFile(url);
        } else {
            // if it still fails, then throw an error and quit
            self.postMessage({
                cobaltFetchWorker: {
                    error: code,
                }
            });
            self.close();
        }
    };

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return error("queue.fetch.bad_response");
        }

        const contentType = response.headers.get('Content-Type')
                                || 'application/octet-stream';

        const contentLength = response.headers.get('Content-Length');
        const estimatedLength = response.headers.get('Estimated-Content-Length');

        let totalBytes;

        if (contentLength) {
            totalBytes = +contentLength;
        } else if (estimatedLength) {
            totalBytes = +estimatedLength;
        }

        const reader = response.body?.getReader();

        const storage = await Storage.init(totalBytes);

        if (!reader) {
            return error("queue.fetch.no_file_reader");
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
            return error("queue.fetch.empty_tunnel");
        }

        const file = Storage.retype(await storage.res(), contentType);

        if (contentLength && Number(contentLength) !== file.size) {
            return error("queue.fetch.corrupted_file");
        }

        self.postMessage({
            cobaltFetchWorker: {
                result: file
            }
        });
    } catch (e) {
        console.error("error from the fetch worker:");
        console.error(e);
        return error("queue.generic_error");
    }
}

self.onmessage = async (event: MessageEvent) => {
    if (event.data.cobaltFetchWorker) {
        await fetchFile(event.data.cobaltFetchWorker.url);
        self.close();
    }
}
