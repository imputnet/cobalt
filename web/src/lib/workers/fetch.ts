import { OPFSStorage } from "$lib/storage";

const error = (code: string) => {
    // TODO: return proper errors and code here
    self.postMessage({
        cobaltFetchWorker: {
            error: code,
        }
    })
};

const fetchFile = async (url: string) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            error("file response wasn't ok");
            return self.close();
        }

        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const contentLength = response.headers.get('Content-Length');

        const totalBytes = contentLength ? parseInt(contentLength, 10) : null;
        const reader = response.body?.getReader();

        const storage = await OPFSStorage.init();

        if (!reader) {
            error("no reader");
            return self.close();
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
            error("tunnel is broken");
            return self.close();
        }

        const file = await storage.res();

        if (Number(contentLength) !== file.size) {
            error("file is not downloaded fully");
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
        error("error when downloading the file");
        return self.close();
    }
}

self.onmessage = async (event: MessageEvent) => {
    if (event.data.cobaltFetchWorker) {
        await fetchFile(event.data.cobaltFetchWorker.url);
        self.close();
    }
}
