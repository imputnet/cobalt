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
        // TODO: stream testing
    }
}