import NodeCache from "node-cache";

import { nanoid } from "nanoid";
import { randomBytes } from "crypto";
import { strict as assert } from "assert";
import { setMaxListeners } from "node:events";

import { env } from "../config.js";
import { closeRequest } from "./shared.js";
import { decryptStream, encryptStream, generateHmac } from "../misc/crypto.js";

// optional dependency
const freebind = env.freebindCIDR && await import('freebind').catch(() => {});

const streamCache = new NodeCache({
    stdTTL: env.streamLifespan,
    checkperiod: 10,
    deleteOnExpire: true
})

streamCache.on("expired", (key) => {
    streamCache.del(key);
})

const internalStreamCache = new Map();
const hmacSalt = randomBytes(64).toString('hex');

export function createStream(obj) {
    const streamID = nanoid(),
        iv = randomBytes(16).toString('base64url'),
        secret = randomBytes(32).toString('base64url'),
        exp = new Date().getTime() + env.streamLifespan * 1000,
        hmac = generateHmac(`${streamID},${exp},${iv},${secret}`, hmacSalt),
        streamData = {
            exp: exp,
            type: obj.type,
            urls: obj.u,
            service: obj.service,
            filename: obj.filename,

            requestIP: obj.requestIP,
            headers: obj.headers,

            metadata: obj.fileMetadata || false,

            audioBitrate: obj.audioBitrate,
            audioCopy: !!obj.audioCopy,
            audioFormat: obj.audioFormat,
        };

    streamCache.set(
        streamID,
        encryptStream(streamData, iv, secret)
    )

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

export function getInternalStream(id) {
    return internalStreamCache.get(id);
}

export function createInternalStream(url, obj = {}) {
    assert(typeof url === 'string');

    let dispatcher;
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
        dispatcher
    });

    let streamLink = new URL('/itunnel', `http://127.0.0.1:${env.apiPort}`);
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
        closeRequest(getInternalStream(id)?.controller);
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

export function verifyStream(id, hmac, exp, secret, iv) {
    try {
        const ghmac = generateHmac(`${id},${exp},${iv},${secret}`, hmacSalt);
        const cache = streamCache.get(id.toString());

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
