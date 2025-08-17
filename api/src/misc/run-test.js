import { normalizeRequest } from "../processing/request.js";
import match from "../processing/match.js";
import { extract } from "../processing/url.js";

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

    if (result.body.status === 'tunnel') {
        const streamRes = await fetch(result.body.url).catch((e) => {
            throw `failed to fetch stream: ${e}`;
        });

        const expectedStream = expect.stream || {};
        const expectedStatus = expectedStream.code || 200;

        if (streamRes.status !== expectedStatus) {
            throw `stream status code mismatch: ${expectedStatus} (expected) != ${streamRes.status} (actual)`;
        }

        if (expectedStream.headers) {
            for (const [key, value] of Object.entries(expectedStream.headers)) {
                const actual = streamRes.headers.get(key);
                if (actual !== value) {
                    throw `stream header mismatch for ${key}: ${value} (expected) != ${actual} (actual)`;
                }
            }
        }

        // terminate early to avoid downloading full file
        streamRes.body?.cancel();
    }
}
