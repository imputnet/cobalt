import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { after, test } from "node:test";
import { Agent, setGlobalDispatcher } from "undici";
import { probeInternalTunnel } from "../src/stream/internal.js";

const dispatcher = new Agent();
setGlobalDispatcher(dispatcher);
after(() => dispatcher.destroy());

async function setup(t, segments, serveSegment, durations = []) {
    const server = createServer((req, res) => {
        if (req.url === '/redirect') {
            return res.writeHead(302, { location: '/media/list.m3u8' }).end();
        }
        if (req.url === '/media/list.m3u8') {
            return res.end([
                '#EXTM3U', '#EXT-X-VERSION:4', '#EXT-X-TARGETDURATION:9',
                ...segments.flatMap((segment, i) => [`#EXTINF:${durations[i] ?? 4},`, segment]),
                '#EXT-X-ENDLIST', '',
            ].join('\n'));
        }
        serveSegment(req, res);
    });
    server.listen(0, '127.0.0.1');
    t.after(() => {
        server.close();
        server.closeAllConnections();
    });
    await once(server, 'listening');
    const url = `http://127.0.0.1:${server.address().port}/redirect`;
    return () => probeInternalTunnel({ url, isHLS: true });
}

test('probes short HLS playlists once per resource with a one-byte range', async t => {
    const requests = [];
    const probe = await setup(t, ['one.ts', 'two.ts', 'one.ts'], (req, res) => {
        requests.push([req.url, req.headers.range]);
        res.writeHead(206, { 'content-range': 'bytes 0-0/2000', 'content-length': 1 });
        res.end('x');
    });

    assert.equal(await probe(), 6000);
    assert.deepEqual(requests.sort(), [
        ['/media/one.ts', 'bytes=0-0'],
        ['/media/two.ts', 'bytes=0-0'],
    ]);
});

test('uses HLS byte-range lengths without fetching the media', async t => {
    const requests = [];
    const probe = await setup(t, [
        '#EXT-X-BYTERANGE:2000@0\npacked.ts',
        '#EXT-X-BYTERANGE:4000\npacked.ts',
    ], (req, res) => {
        requests.push(req.url);
        res.writeHead(500).end();
    }, [1, 9]);

    assert.equal(await probe(), 6000);
    assert.deepEqual(requests, []);
});

test('cancels ignored ranges and estimates from samples that have a size', async t => {
    const closed = [];
    const probe = await setup(t, ['known.ts', 'unknown.ts', 'gone.ts'], (req, res) => {
        closed.push(once(res, 'close'));
        if (req.url === '/media/gone.ts') {
            return res.writeHead(404).end();
        }
        if (req.url === '/media/known.ts') {
            res.setHeader('content-length', 8000000);
        }
        res.write('partial body');
    });

    assert.equal(await probe(), 24000000);
    await Promise.all(closed);
});

test('reports an unknown estimate if no sample supplies a size', async t => {
    const probe = await setup(t, ['unknown.ts'], (_, res) => {
        res.writeHead(206, { 'content-range': 'bytes 0-0/*', 'content-length': 1 });
        res.end('x');
    });

    assert.equal(await probe(), -1);
});
