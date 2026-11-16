import { test } from "node:test";
import assert from "node:assert/strict";

import { fromSharePageHLS } from "./loom.js";

const withFetch = async (impl, fn) => {
    const original = globalThis.fetch;
    globalThis.fetch = impl;
    try {
        return await fn();
    } finally {
        globalThis.fetch = original;
    }
};

const SIGNED_URL = "https://luna.loom.com/id/abc/rev/def/resource/hls/playlist-split.m3u8?Policy=XYZ&Signature=ABC&Key-Pair-Id=K1";

// the share page embeds the graphql cache with escaped quotes/slashes
const PAGE_WITH_ENTRY = `<html><script>self.__cache={}
"nullableRawCdnUrl({\\"acceptableMimes\\":[\\"DASH\\"],\\"password\\":null})":null,
"nullableRawCdnUrl({\\"acceptableMimes\\":[\\"M3U8\\"],\\"password\\":null})":{"__typename":"CloudfrontSignedUrlPayload","url":"${SIGNED_URL.replaceAll("&", "\\u0026").replaceAll("/", "\\/")}"}
</script></html>`;

test("fallback extracts and cleans the signed playlist url from a real-shaped page", async () => {
    const url = await withFetch(
        async () => ({ ok: true, text: async () => PAGE_WITH_ENTRY }),
        () => fromSharePageHLS("abc")
    );
    assert.equal(url, SIGNED_URL);
});

test("network failure returns undefined, never throws", async () => {
    const url = await withFetch(
        async () => { throw new Error("connection reset"); },
        () => fromSharePageHLS("abc")
    );
    assert.equal(url, undefined);
});

test("non-ok http response returns undefined", async () => {
    const url = await withFetch(
        async () => ({ ok: false, status: 503, text: async () => PAGE_WITH_ENTRY }),
        () => fromSharePageHLS("abc")
    );
    assert.equal(url, undefined);
});

test("page without a cache entry returns undefined", async () => {
    const url = await withFetch(
        async () => ({ ok: true, text: async () => "<html>no video data here</html>" }),
        () => fromSharePageHLS("abc")
    );
    assert.equal(url, undefined);
});

test("cache entry whose url is not an m3u8 playlist is ignored", async () => {
    const page = `"nullableRawCdnUrl({\\"acceptableMimes\\":[\\"M3U8\\"]})":{"__typename":"CloudfrontSignedUrlPayload","url":"https://luna.loom.com/id/abc/rev/def/resource/poster.jpg?Policy=XYZ"}`;
    const url = await withFetch(
        async () => ({ ok: true, text: async () => page }),
        () => fromSharePageHLS("abc")
    );
    assert.equal(url, undefined);
});
