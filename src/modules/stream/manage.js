import NodeCache from "node-cache";
import { randomBytes } from "crypto";
import { nanoid } from 'nanoid';

import { sha256 } from "../sub/crypto.js";
import { streamLifespan } from "../config.js";

const streamCache = new NodeCache({
    stdTTL: streamLifespan/1000,
    checkperiod: 10,
    deleteOnExpire: true
})

streamCache.on("expired", (key) => {
    streamCache.del(key);
})

const streamSalt = randomBytes(64).toString('hex');

export function createStream(obj) {
    let streamID = nanoid(),
        exp = Math.floor(new Date().getTime()) + streamLifespan,
        ghmac = sha256(`${streamID},${obj.service},${exp}`, streamSalt);

    if (!streamCache.has(streamID)) {
        streamCache.set(streamID, {
            id: streamID,
            service: obj.service,
            type: obj.type,
            urls: obj.u,
            filename: obj.filename,
            hmac: ghmac,
            exp: exp,
            isAudioOnly: !!obj.isAudioOnly,
            audioFormat: obj.audioFormat,
            time: obj.time ? obj.time : false,
            copy: !!obj.copy,
            mute: !!obj.mute,
            metadata: obj.fileMetadata ? obj.fileMetadata : false
        });
    } else {
        let streamInfo = streamCache.get(streamID);
        exp = streamInfo.exp;
        ghmac = streamInfo.hmac;
    }
    return `${process.env.apiURL || process.env.selfURL}api/stream?t=${streamID}&e=${exp}&h=${ghmac}`;
}

export function verifyStream(id, hmac, exp) {
    try {
        let streamInfo = streamCache.get(id.toString());
        if (!streamInfo) return {
            error: "this download link has expired or doesn't exist. go back and try again!",
            status: 400
        }

        let ghmac = sha256(`${id},${streamInfo.service},${exp}`, streamSalt);
        if (String(hmac) === ghmac && String(exp) === String(streamInfo.exp) && ghmac === String(streamInfo.hmac)
            && Number(exp) > Math.floor(new Date().getTime())) {
            return streamInfo;
        }
        return {
            error: "i couldn't verify if you have access to this stream. go back and try again!",
            status: 401
        }
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error" } };
    }
}
