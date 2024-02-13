import NodeCache from "node-cache";
import { randomBytes } from "crypto";
import { nanoid } from 'nanoid';

import { decryptStream, encryptStream, generateHmac } from "../util/crypto.js";
import { streamLifespan } from "../../core/config.js";

const streamNoAccess = {
    error: "i couldn't verify if you have access to this stream. go back and try again!",
    status: 401
}
const streamNoExist = {
    error: "this download link has expired or doesn't exist. go back and try again!",
    status: 400
}

const streamCache = new NodeCache({
    stdTTL: streamLifespan/1000,
    checkperiod: 10,
    deleteOnExpire: true
})

streamCache.on("expired", (key) => {
    streamCache.del(key);
})

const hmacSalt = randomBytes(64).toString('hex');

export function createStream(obj) {
    const streamID = nanoid(),
        iv = randomBytes(16).toString('base64url'),
        secret = randomBytes(32).toString('base64url'),
        exp = new Date().getTime() + streamLifespan,
        hmac = generateHmac(`${streamID},${exp},${iv},${secret}`, hmacSalt),
        streamData = {
            exp: exp,
            type: obj.type,
            urls: obj.u,
            service: obj.service,
            filename: obj.filename,
            audioFormat: obj.audioFormat,
            isAudioOnly: !!obj.isAudioOnly,
            copy: !!obj.copy,
            mute: !!obj.mute,
            metadata: obj.fileMetadata || false
        };

    streamCache.set(
        streamID,
        encryptStream(streamData, iv, secret)
    )

    let streamLink = new URL('/api/stream', process.env.API_URL);

    const params = {
        't': streamID,
        'e': exp,
        'h': hmac,
        's': secret,
        'i': iv
    }

    for (const [key, value] of Object.entries(params)) {
        streamLink.searchParams.append(key, value);
    }

    return streamLink.toString();
}

export function verifyStream(id, hmac, exp, secret, iv) {
    try {
        const ghmac = generateHmac(`${id},${exp},${iv},${secret}`, hmacSalt);
        const cache = streamCache.get(id.toString());

        if (ghmac !== String(hmac)) return streamNoAccess;
        if (!cache) return streamNoExist;

        const streamInfo = JSON.parse(decryptStream(cache, iv, secret));

        if (!streamInfo) return streamNoExist;

        if (Number(exp) <= new Date().getTime())
            return streamNoExist;

        return streamInfo;
    }
    catch (e) {
        return {
            error: "something went wrong and i couldn't verify this stream. go back and try again!",
            status: 500
        }
    }
}
