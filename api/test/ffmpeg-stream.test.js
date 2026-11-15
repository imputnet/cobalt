import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { after, test } from "node:test";
import express from "express";
import { Agent, setGlobalDispatcher } from "undici";
import { setTunnelPort } from "../src/config.js";
import ffmpeg from "../src/stream/ffmpeg.js";
import { internalStream } from "../src/stream/internal.js";
import { createInternalStream, getInternalTunnelFromURL } from "../src/stream/manage.js";

const dispatcher = new Agent();
setGlobalDispatcher(dispatcher);
after(() => dispatcher.destroy());

const wav = Buffer.alloc(44 + 8000 * 2);
wav.write('RIFF', 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24);
wav.writeUInt32LE(16000, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(wav.length - 44, 40);

async function setup(t, { probeDelay, mediaDelay }) {
    const app = express();
    const server = createServer(app);
    server.listen(0, '127.0.0.1');
    t.after(() => {
        server.close();
        server.closeAllConnections();
    });
    await once(server, 'listening');
    const { port } = server.address();
    setTunnelPort(port);
    const media = createInternalStream(`http://127.0.0.1:${port}/source`);
    const source = getInternalTunnelFromURL(media);
    source.headers = new Map();

    let probeStarted, mediaStarted, probeClosed, mediaClosed;
    const probeStart = new Promise(resolve => { probeStarted = resolve; });
    const mediaStart = new Promise(resolve => { mediaStarted = resolve; });
    const probeDone = new Promise(resolve => { probeClosed = resolve; });
    const mediaDone = new Promise(resolve => { mediaClosed = resolve; });
    app.get('/source', (req, res) => {
        const isProbe = req.method === 'HEAD';
        if (isProbe) probeStarted();
        else mediaStarted();
        const timer = setTimeout(() => {
            res.setHeader('Content-Length', wav.length);
            res.setHeader('Content-Type', 'audio/wav');
            res.end(isProbe ? undefined : wav);
        }, isProbe ? probeDelay : mediaDelay);
        res.once('close', () => {
            clearTimeout(timer);
            if (isProbe) probeClosed(res.writableFinished);
            else mediaClosed(res.writableFinished);
        });
    });
    app.get('/itunnel', (_, res) => internalStream(source, res));
    app.get('/download', (_, res) => ffmpeg.convertAudio({
        urls: media, filename: 'test.mp3', audioFormat: 'mp3', audioBitrate: '32',
    }, res));
    return { url: `http://127.0.0.1:${port}/download`, probeStart, mediaStart, probeDone, mediaDone };
}

test('starts a ready MP3 download while the size probe is pending', async t => {
    const { url, probeDone } = await setup(t, { probeDelay: 1500, mediaDelay: 0 });
    const response = await fetch(url);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Estimated-Content-Length'), '-1');
    const audio = Buffer.from(await response.arrayBuffer());
    assert.equal(audio.toString('ascii', 0, 3), 'ID3');
    assert.ok(audio.length > 1000);
    assert.equal(await probeDone, false);

    const fast = await setup(t, { probeDelay: 0, mediaDelay: 150 });
    const estimated = await fetch(fast.url);

    assert.equal(estimated.status, 200);
    assert.equal(estimated.headers.get('Estimated-Content-Length'), '4412');
    assert.deepEqual(Buffer.from(await estimated.arrayBuffer()), audio);
    assert.equal(await fast.probeDone, true);
});

test('cancels media and size requests when the client disconnects', async t => {
    const { url, probeStart, mediaStart, probeDone, mediaDone } = await setup(
        t, { probeDelay: 1500, mediaDelay: 1500 },
    );
    const controller = new AbortController();
    const download = fetch(url, { signal: controller.signal });
    const aborted = assert.rejects(download, { name: 'AbortError' });
    await Promise.all([probeStart, mediaStart]);
    controller.abort();

    await aborted;
    assert.equal(await probeDone, false);
    assert.equal(await mediaDone, false);
});
