import { Writable } from "node:stream";

import { normalizeRequest } from "../processing/request.js";
import match from "../processing/match.js";
import { extract } from "../processing/url.js";
import stream from "../stream/stream.js";
import { verifyStream } from "../stream/manage.js";

class MockResponse extends Writable {
    constructor() {
        super();
        this.statusCode = 200;
        this.bytes = 0;
        this.headersSent = false;
    }
    setHeader() {}
    status(code) { this.statusCode = code; return this; }
    sendStatus(code) { this.statusCode = code; this.end(); return this; }
    _write(chunk, _, cb) { this.bytes += chunk.length; this.headersSent = true; cb(); }
}

async function drainTunnel(tunnelUrl) {
    const u = new URL(tunnelUrl);
    const streamInfo = await verifyStream(
        u.searchParams.get('id'),
        u.searchParams.get('sig'),
        u.searchParams.get('exp'),
        u.searchParams.get('sec'),
        u.searchParams.get('iv'),
    );
    if (!streamInfo?.service) {
        throw `verifyStream failed: status ${streamInfo?.status}`;
    }

    const res = new MockResponse();
    await new Promise((resolve, reject) => {
        res.on('finish', resolve);
        res.on('close', resolve);
        res.on('error', reject);
        stream(res, streamInfo).catch(reject);
    });

    return res;
}

export async function runTest(url, params, expect) {
    const { success, data: normalized } = await normalizeRequest({ url, ...params });
    if (!success) {
        throw "invalid request";
    }

    const parsed = extract(normalized.url);
    if (parsed === null) {
        throw `invalid url: ${normalized.url}`;
    }

    const result = await match({
        host: parsed.host,
        patternMatch: parsed.patternMatch,
        params: normalized,
    });

    let error = [];
    if (expect.status !== result.body.status) {
        const detail = `${expect.status} (expected) != ${result.body.status} (actual)`;
        error.push(`status mismatch: ${detail}`);

        if (result.body.status === 'error') {
            error.push(`error code: ${result.body?.error?.code}`);
        }
    }

    if (expect.errorCode && expect.errorCode !== result.body?.error?.code) {
        const detail = `${expect.errorCode} (expected) != ${result.body.error.code} (actual)`
        error.push(`error mismatch: ${detail}`);
    }

    if (expect.code !== result.status) {
        const detail = `${expect.code} (expected) != ${result.status} (actual)`;
        error.push(`status code mismatch: ${detail}`);
    }

    if (error.length) {
        if (result.body.text) {
            error.push(`error message: ${result.body.text}`);
        }

        throw error.join('\n');
    }

    if (result.body.status === 'tunnel' && expect.minBytes) {
        const res = await drainTunnel(result.body.url);
        if (res.bytes < expect.minBytes) {
            throw `streamed ${res.bytes} bytes, expected at least ${expect.minBytes}`;
        }
    }
}
