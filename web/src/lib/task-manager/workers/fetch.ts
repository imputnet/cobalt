import * as Storage from "$lib/storage";

let attempts = 0;

const fetchFile = async (url: string) => {
    const error = async (code: string, retry: boolean = true) => {
        attempts++;

        // try 3 more times before actually failing
        if (retry && attempts <= 3) {
            await fetchFile(url);
        } else {
            self.postMessage({
                cobaltFetchWorker: {
                    error: code,
                }
            });
            return self.close();
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

        let expectedSize;

        if (contentLength) {
            expectedSize = +contentLength;
        } else if (estimatedLength) {
            expectedSize = +estimatedLength;
        }

        const reader = response.body?.getReader();

        const storage = await Storage.init(expectedSize);

        if (!reader) {
            return error("queue.fetch.no_file_reader");
        }

        let receivedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            await storage.write(value, receivedBytes);
            receivedBytes += value.length;

            if (expectedSize) {
                self.postMessage({
                    cobaltFetchWorker: {
                        progress: Math.round((receivedBytes / expectedSize) * 100),
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
            return error("queue.fetch.corrupted_file", false);
        }

        self.postMessage({
            cobaltFetchWorker: {
                result: file
            }
        });
    } catch (e) {
        console.error("error from the fetch worker:");
        console.error(e);
        return error("queue.fetch.crashed", false);
    }
}

self.onmessage = async (event: MessageEvent) => {
    if (event.data.cobaltFetchWorker) {
        await fetchFile(event.data.cobaltFetchWorker.url);
        self.close();
    }
}
