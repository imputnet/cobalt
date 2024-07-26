import { normalizeRequest } from "../modules/processing/request.js";
import match from "./processing/match.js";
import { extract } from "./processing/url.js";

export async function runTest(url, params, expect) {
    const normalized = normalizeRequest({ url, ...params });
    if (!normalized) {
        throw "invalid request";
    }

    const parsed = extract(normalized.url);
    if (parsed === null) {
        throw `invalid url: ${normalized.url}`;
    }

    const result = await match(
        parsed.host, parsed.patternMatch, "en", normalized
    );

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

    if (result.body.status === 'stream') {
        // TODO: stream testing
    }
}