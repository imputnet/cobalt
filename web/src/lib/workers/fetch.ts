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

        if (!reader) {
            error("no reader");
            return self.close();
        }

        let receivedBytes = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            receivedBytes += value.length;
            chunks.push(value);

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

        const file = new File(chunks, "file", { type: contentType });

        self.postMessage({
            cobaltFetchWorker: {
                file
            }
        });
    } catch (e) {
        console.log(e)
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
