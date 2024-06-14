import NodeCache from "node-cache";
import { randomBytes } from "crypto";
import { nanoid } from "nanoid";

import { decryptStream, encryptStream, generateHmac } from "../sub/crypto.js";
import { env } from "../config.js";
import { strict as assert } from "assert";

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

const internalStreamCache = {};
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
            audioFormat: obj.audioFormat,
            isAudioOnly: !!obj.isAudioOnly,
            headers: obj.headers,
            copy: !!obj.copy,
            mute: !!obj.mute,
            metadata: obj.fileMetadata || false,
            requestIP: obj.requestIP
        };

    streamCache.set(
        streamID,
        encryptStream(streamData, iv, secret)
    )

    let streamLink = new URL('/api/stream', env.apiURL);

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
    return internalStreamCache[id];
}

export function createInternalStream(url, obj = {}) {
    assert(typeof url === 'string');

    let dispatcher;
    if (obj.requestIP) {
        dispatcher = freebind?.dispatcherFromIP(obj.requestIP, { strict: false })
    }

    const streamID = nanoid();
    const controller = new AbortController();
    internalStreamCache[streamID] = {
        url,
        service: obj.service,
        headers: obj.headers,
        controller,
        dispatcher
    };

    let streamLink = new URL('/api/istream', `http://127.0.0.1:${env.apiPort}`);
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

    if (internalStreamCache[id]) {
        internalStreamCache[id].controller.abort();
        delete internalStreamCache[id];
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
