import { test } from "node:test";
import assert from "node:assert/strict";

import { resolveHlsUri, isHlsResponse } from "./internal-hls.js";

const policyFor = (resource) => Buffer.from(
    JSON.stringify({ Statement: [{ Resource: resource, Condition: {} }] }),
    "utf8"
).toString("base64url");

const masterWith = (resource) =>
    "https://luna.loom.com/id/abc/rev/def/resource/hls/playlist.m3u8"
    + `?Policy=${policyFor(resource)}&Signature=ABC&Key-Pair-Id=K1`;

const WILDCARD_MASTER = masterWith("https://luna.loom.com/id/abc/rev/def/resource/*");
const loomInfo = { service: "loom", url: WILDCARD_MASTER };

test("loom: same-origin relative uri inside the policy scope inherits the signature", () => {
    const u = resolveHlsUri(loomInfo, "segment-0.ts");
    assert.equal(
        u.toString(),
        "https://luna.loom.com/id/abc/rev/def/resource/hls/segment-0.ts"
        + `?Policy=${policyFor("https://luna.loom.com/id/abc/rev/def/resource/*")}&Signature=ABC&Key-Pair-Id=K1`
    );
});

test("loom: directory traversal outside the policy scope does not inherit", () => {
    const u = resolveHlsUri(loomInfo, "../../outside/seg.ts");
    assert.equal(u.toString(), "https://luna.loom.com/id/abc/rev/def/outside/seg.ts");
});

test("loom: same-origin root path outside the policy scope does not inherit", () => {
    const u = resolveHlsUri(loomInfo, "/seg.ts");
    assert.equal(u.toString(), "https://luna.loom.com/seg.ts");
});

test("loom: protocol-relative cross-origin uri does not inherit the signature", () => {
    const u = resolveHlsUri(loomInfo, "//other-host.example/resource/hls/seg.ts");
    assert.equal(u.toString(), "https://other-host.example/resource/hls/seg.ts");
});

test("loom: child uri with its own query is not overridden", () => {
    const u = resolveHlsUri(loomInfo, "segment-0.ts?token=own");
    assert.equal(u.search, "?token=own");
});

test("loom: absolute child url is untouched", () => {
    const u = resolveHlsUri(loomInfo, "https://cdn.example.com/a.ts?x=1");
    assert.equal(u.toString(), "https://cdn.example.com/a.ts?x=1");
});

test("loom: exact-resource policy (no wildcard) covers no children", () => {
    const info = { service: "loom", url: masterWith("https://luna.loom.com/id/abc/rev/def/resource/hls/playlist.m3u8") };
    const u = resolveHlsUri(info, "segment-0.ts");
    assert.equal(u.search, "");
});

test("loom: unparsable policy means no inheritance and no throw", () => {
    const info = { service: "loom", url: "https://luna.loom.com/x/master.m3u8?Policy=!!!&Signature=ABC" };
    const u = resolveHlsUri(info, "seg.ts");
    assert.equal(u.search, "");
});

test("other services: relative uri never inherits the parent query", () => {
    const u = resolveHlsUri({ service: "vimeo", url: WILDCARD_MASTER }, "segment-0.ts");
    assert.equal(u.search, "");
});

test("loom: base playlist without a query leaves the child bare", () => {
    const u = resolveHlsUri(
        { service: "loom", url: "https://luna.loom.com/hls/master.m3u8" },
        "seg.ts"
    );
    assert.equal(u.search, "");
});

test("isHlsResponse: charset-suffixed mime matches", () => {
    const req = { headers: { "content-type": "application/vnd.apple.mpegurl; charset=utf-8" } };
    assert.equal(isHlsResponse(req, { service: "loom", url: "https://x/a" }), true);
});

test("isHlsResponse: uppercase mime matches", () => {
    const req = { headers: { "content-type": "Application/VND.Apple.MPEGURL" } };
    assert.equal(isHlsResponse(req, { service: "loom", url: "https://x/a" }), true);
});

test("isHlsResponse: x-mpegurl alias matches in any case", () => {
    const req = { headers: { "content-type": "application/x-mpegURL" } };
    assert.equal(isHlsResponse(req, { service: "loom", url: "https://x/a" }), true);
});

test("isHlsResponse: non-hls mime does not match", () => {
    const req = { headers: { "content-type": "video/mp4" } };
    assert.equal(isHlsResponse(req, { service: "loom", url: "https://x/a" }), false);
});

test("isHlsResponse: missing content-type does not throw", () => {
    const req = { headers: {} };
    assert.equal(isHlsResponse(req, { service: "loom", url: "https://x/a" }), false);
});
