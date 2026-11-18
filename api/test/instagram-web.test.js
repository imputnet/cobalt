import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import instagram from "../src/processing/services/instagram.js";
import { loadFromFile } from "../src/processing/cookie/manager.js";

test('web fallback for a publicly resolvable reel', async t => {
    const dir = await mkdtemp(join(tmpdir(), 'cobalt-instagram-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const cookies = join(dir, 'cookies.json');
    await writeFile(cookies, JSON.stringify({ instagram: ['test=fixture'] }));
    t.mock.method(globalThis, 'setInterval', () => 1);
    await loadFromFile(cookies);

    let item;
    let embedRequests = 0;
    const video = 'https://example.invalid/reel.mp4';
    const fixtureResponse = input => {
        const url = new URL(input);
        if (url.pathname.includes('/oembed/')) return Response.json({ media_id: '1' });
        if (url.hostname === 'i.instagram.com') return Response.json({ status: 'fail' });
        if (url.pathname.endsWith('/info/')) return Response.json({ items: [item] });
        if (url.pathname.endsWith('/embed/captioned/')) {
            embedRequests++;
            const data = { gql_data: { shortcode_media: { video_url: video } } };
            const embed = JSON.stringify({ contextJSON: JSON.stringify(data) });
            return new Response(`"init",[],[${embed}]],`);
        }
        throw new Error('unexpected request');
    };
    t.mock.method(globalThis, 'fetch', input => Promise.resolve(fixtureResponse(input)));

    item = { media_type: 2, video_versions: [{ url: video, width: 32, height: 32 }] };
    assert.equal((await instagram({ postId: 'fixture' })).urls, video);
    assert.equal(embedRequests, 0);

    item = { media_type: 2, image_versions2: { candidates: [{ url: 'cover.jpg' }] } };
    assert.equal((await instagram({ postId: 'fixture' })).urls, video);
    assert.equal(embedRequests, 1);

    item = { user: { is_private: true }, video_versions: [{ url: video }] };
    assert.deepEqual(await instagram({ postId: 'fixture' }), { error: 'content.post.private' });
    assert.equal(embedRequests, 1);
});
