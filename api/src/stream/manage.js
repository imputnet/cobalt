import Store from "../store/store.js";

import { nanoid } from "nanoid";
import { randomBytes } from "crypto";
import { strict as assert } from "assert";
import { setMaxListeners } from "node:events";

import { env } from "../config.js";
import { closeRequest } from "./shared.js";
import { decryptStream, encryptStream } from "../misc/crypto.js";
import { hashHmac } from "../security/secrets.js";
import { zip } from "../misc/utils.js";

// optional dependency
const freebind = env.freebindCIDR && await import('freebind').catch(() => {});

const streamCache = new Store('streams');

const internalStreamCache = new Map();

export function createStream(obj) {
    const streamID = nanoid(),
        iv = randomBytes(16).toString('base64url'),
        secret = randomBytes(32).toString('base64url'),
        exp = new Date().getTime() + env.streamLifespan * 1000,
        hmac = hashHmac(`${streamID},${exp},${iv},${secret}`, 'stream').toString('base64url'),
        streamData = {
            exp: exp,
            type: obj.type,
            urls: obj.url,
            service: obj.service,
            filename: obj.filename,

            requestIP: obj.requestIP,
            headers: obj.headers,

            metadata: obj.fileMetadata || false,

            audioBitrate: obj.audioBitrate,
            audioCopy: !!obj.audioCopy,
            audioFormat: obj.audioFormat,

            isHLS: obj.isHLS || false,
            originalRequest: obj.originalRequest
        };

    // FIXME: this is now a Promise, but it is not awaited
    //        here. it may happen that the stream is not
    //        stored in the Store before it is requested.
    streamCache.set(
        streamID,
        encryptStream(streamData, iv, secret),
        env.streamLifespan
    );

    let streamLink = new URL('/tunnel', env.apiURL);

    const params = {
        'id': streamID,
        'exp': exp,
        'sig': hmac,
        'sec': secret,
        'iv': iv
    }

    for (const [key, value] of Object.entries(params)) {
        streamLink.searchParams.append(key, value);
    }

    return streamLink.toString();
}

export function createProxyTunnels(info) {
    const proxyTunnels = [];

    let urls = info.url;

    if (typeof urls === "string") {
        urls = [urls];
    }

    for (const url of urls) {
        proxyTunnels.push(
            createStream({
                url,
                type: "proxy",

                service: info?.service,
                headers: info?.headers,
                requestIP: info?.requestIP,

                originalRequest: info?.originalRequest
            })
        );
    }

    return proxyTunnels;
}

export function getInternalTunnel(id) {
    return internalStreamCache.get(id);
}

export function getInternalTunnelFromURL(url) {
    url = new URL(url);
    if (url.hostname !== '127.0.0.1') {
        return;
    }

    const id = url.searchParams.get('id');
    return getInternalTunnel(id);
}

export function createInternalStream(url, obj = {}) {
    assert(typeof url === 'string');

    let dispatcher = obj.dispatcher;
    if (obj.requestIP) {
        dispatcher = freebind?.dispatcherFromIP(obj.requestIP, { strict: false })
    }

    const streamID = nanoid();
    let controller = obj.controller;

    if (!controller) {
        controller = new AbortController();
        setMaxListeners(Infinity, controller.signal);
    }

    let headers;
    if (obj.headers) {
        headers = new Map(Object.entries(obj.headers));
    }

    internalStreamCache.set(streamID, {
        url,
        service: obj.service,
        headers,
        controller,
        dispatcher,
        isHLS: obj.isHLS,
        transplant: obj.transplant
    });

    let streamLink = new URL('/itunnel', `http://127.0.0.1:${env.tunnelPort}`);
    streamLink.searchParams.set('id', streamID);

    const cleanup = () => {
        destroyInternalStream(streamLink);
        controller.signal.removeEventListener('abort', cleanup);
    }

    controller.signal.addEventListener('abort', cleanup);

    return streamLink.toString();
}

function getInternalTunnelId(url) {
    url = new URL(url);
    if (url.hostname !== '127.0.0.1') {
        return;
    }

    return url.searchParams.get('id');
}

export function destroyInternalStream(url) {
    const id = getInternalTunnelId(url);

    if (internalStreamCache.has(id)) {
        closeRequest(getInternalTunnel(id)?.controller);
        internalStreamCache.delete(id);
    }
}

const transplantInternalTunnels = function(tunnelUrls, transplantUrls) {
    if (tunnelUrls.length !== transplantUrls.length) {
        return;
    }

    for (const [ tun, url ] of zip(tunnelUrls, transplantUrls)) {
        const id = getInternalTunnelId(tun);
        const itunnel = getInternalTunnel(id);

        if (!itunnel) continue;
        itunnel.url = url;
    }
}

const transplantTunnel = async function (dispatcher) {
    if (this.pendingTransplant) {
        await this.pendingTransplant;
        return;
    }

    let finished;
    this.pendingTransplant = new Promise(r => finished = r);

    try {
        const handler = await import(`../processing/services/${this.service}.js`);
        const response = await handler.default({
            ...this.originalRequest,
            dispatcher
        });

        if (!response.urls) {
            return;
        }

        response.urls = [response.urls].flat();
        if (this.originalRequest.isAudioOnly && response.urls.length > 1) {
            response.urls = [response.urls[1]];
        } else if (this.originalRequest.isAudioMuted) {
            response.urls = [response.urls[0]];
        }

        const tunnels = [this.urls].flat();
        if (tunnels.length !== response.urls.length) {
            return;
        }

        transplantInternalTunnels(tunnels, response.urls);
    }
    catch {}
    finally {
        finished();
        delete this.pendingTransplant;
    }
}

function wrapStream(streamInfo) {
    const url = streamInfo.urls;

    if (streamInfo.originalRequest) {
        streamInfo.transplant = transplantTunnel.bind(streamInfo);
    }

    if (typeof url === 'string') {
        streamInfo.urls = createInternalStream(url, streamInfo);
    } else if (Array.isArray(url)) {
        for (const idx in streamInfo.urls) {
            streamInfo.urls[idx] = createInternalStream(
                streamInfo.urls[idx], streamInfo
            );
        }
    } else throw 'invalid urls';

    return streamInfo;
}

export async function verifyStream(id, hmac, exp, secret, iv) {
    try {
        const ghmac = hashHmac(`${id},${exp},${iv},${secret}`, 'stream').toString('base64url');
        const cache = await streamCache.get(id.toString());

        if (ghmac !== String(hmac)) return { status: 401 };
        if (!cache) return { status: 404 };

        const streamInfo = JSON.parse(decryptStream(cache, iv, secret));

        if (!streamInfo) return { status: 404 };

        if (Number(exp) <= new Date().getTime())
            return { status: 404 };

        return wrapStream(streamInfo);
    }
    catch {
        return { status: 500 };
    }
}
