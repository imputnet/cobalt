import Store from "../store/store.js";

import { nanoid } from "nanoid";
import { randomBytes } from "crypto";
import { strict as assert } from "assert";
import { setMaxListeners } from "node:events";

import { env } from "../config.js";
import { closeRequest } from "./shared.js";
import { decryptStream, encryptStream } from "../misc/crypto.js";
import { hashHmac } from "../security/secrets.js";

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

export function destroyInternalStream(url) {
    url = new URL(url);
    if (url.hostname !== '127.0.0.1') {
        return;
    }

    const id = url.searchParams.get('id');

    if (internalStreamCache.has(id)) {
        closeRequest(getInternalTunnel(id)?.controller);
        internalStreamCache.delete(id);
    }
}

function wrapStream(streamInfo) {
    const url = streamInfo.urls;

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
