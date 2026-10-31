import { Readable } from 'node:stream';
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MiB request body cap
/** Convert a node IncomingMessage into a Web-standard Request. */
export function nodeRequestToWeb(req) {
    return new Promise((resolve, reject) => {
        const host = req.headers.host ?? 'localhost';
        const url = `http://${host}${req.url ?? '/'}`;
        const method = req.method ?? 'GET';
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined)
                continue;
            if (Array.isArray(value))
                for (const v of value)
                    headers.append(key, v);
            else
                headers.set(key, value);
        }
        const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';
        if (!hasBody || req.destroyed) {
            resolve(new Request(url, { method, headers }));
            return;
        }
        const chunks = [];
        let size = 0;
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(new Error('request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                resolve(new Request(url, { method, headers, body: Buffer.concat(chunks) }));
            }
            catch (e) {
                reject(e instanceof Error ? e : new Error(String(e)));
            }
        });
        req.on('error', reject);
    });
}
/** Pipe a Web-standard Response into a node ServerResponse. */
export async function sendWebResponse(nodeRes, webRes) {
    const headers = {};
    webRes.headers.forEach((value, key) => {
        headers[key] = value;
    });
    nodeRes.writeHead(webRes.status, webRes.statusText || undefined, headers);
    if (!webRes.body) {
        nodeRes.end();
        return;
    }
    await new Promise((resolve, reject) => {
        const nodeStream = Readable.fromWeb(webRes.body);
        nodeStream.pipe(nodeRes);
        nodeStream.on('error', reject);
        nodeRes.on('finish', () => resolve());
        nodeRes.on('close', () => resolve());
    });
}
