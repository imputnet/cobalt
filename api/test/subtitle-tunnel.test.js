import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { test } from "node:test";
import express from "express";
import ffmpeg from "ffmpeg-static";
import { Agent, setGlobalDispatcher } from "undici";
import { env, setTunnelPort } from "../src/config.js";
import { internalStream } from "../src/stream/internal.js";
import { createInternalStream, createStream, getInternalTunnel, getInternalTunnelFromURL, verifyStream } from "../src/stream/manage.js";
import stream from "../src/stream/stream.js";

test('releases subtitle tunnels after completed and interrupted downloads', { timeout: 20000 }, async t => {
    const input = spawnSync(ffmpeg, [
        '-v', 'error', '-f', 'lavfi', '-i', 'color=s=32x32:d=1',
        '-f', 'lavfi', '-i', 'anullsrc', '-shortest', '-c:v', 'libx264',
        '-c:a', 'aac', '-movflags', 'frag_keyframe+empty_moov', '-f', 'mp4', 'pipe:1',
    ]);
    assert.equal(input.status, 0, input.stderr?.toString());
    const app = express();
    const server = createServer(app);
    const dispatcher = new Agent();
    setGlobalDispatcher(dispatcher);
    t.after(() => {
        server.close();
        server.closeAllConnections();
        return dispatcher.destroy();
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const { port } = server.address();
    setTunnelPort(port);
    env.apiURL = `http://127.0.0.1:${port}/`;

    app.get('/video.mp4', (_, res) => res.type('video/mp4').send(input.stdout));
    app.get('/subtitles.vtt', (_, res) => res.type('text/vtt').send(
        'WEBVTT\n\n00:00.000 --> 00:00.800\nFixture subtitle\n',
    ));
    app.get('/itunnel', (req, res) => internalStream(getInternalTunnel(req.query.id), res));

    let wrapped, responseClosed;
    app.get('/tunnel', async (req, res) => {
        const { id, sig, exp, sec, iv } = req.query;
        wrapped = await verifyStream(id, sig, exp, sec, iv);
        responseClosed = once(res, 'close');
        return stream(res, wrapped);
    });

    const fixture = {
        type: 'remux', service: 'loom', filename: 'subtitled.mp4', headers: {},
        url: new URL('/video.mp4', env.apiURL).href,
        subtitles: new URL('/subtitles.vtt', env.apiURL).href,
    };
    const response = await fetch(createStream(fixture));
    assert.equal(response.status, 200);
    const output = Buffer.from(await response.arrayBuffer());
    const subtitle = spawnSync(ffmpeg, [
        '-v', 'error', '-i', 'pipe:0', '-map', '0:s:0', '-f', 'webvtt', 'pipe:1',
    ], { input: output });
    assert.equal(subtitle.status, 0, subtitle.stderr?.toString());
    assert.match(subtitle.stdout.toString(), /Fixture subtitle/);
    assert.equal(getInternalTunnelFromURL(wrapped.urls), undefined);
    assert.equal(getInternalTunnelFromURL(wrapped.subtitles), undefined);

    // Abort a second download while FFmpeg is waiting for the media body.
    app.get('/pending.mp4', (req, res) => {
        if (req.method === 'HEAD') return res.sendStatus(200);
        server.emit('media-pending');
    });
    const pending = once(server, 'media-pending');
    const controller = new AbortController();
    const url = createStream({ ...fixture, url: new URL('/pending.mp4', env.apiURL).href });
    const aborted = assert.rejects(fetch(url, { signal: controller.signal }), { name: 'AbortError' });
    await pending;
    assert.ok(getInternalTunnelFromURL(wrapped.subtitles));
    controller.abort();
    await Promise.all([aborted, responseClosed]);
    assert.equal(getInternalTunnelFromURL(wrapped.subtitles), undefined);
});

test('releases inputs before dispatch if the client already disconnected', async () => {
    setTunnelPort(8192);
    const media = createInternalStream('https://example.invalid/video.mp4');
    const subtitles = createInternalStream('https://example.invalid/subtitles.vtt');
    const response = { destroyed: true };
    await stream(response, { type: 'remux', urls: media, subtitles });
    assert.equal(getInternalTunnelFromURL(media), undefined);
    assert.equal(getInternalTunnelFromURL(subtitles), undefined);
});
