import NodeCache from "node-cache";
import { randomBytes } from "crypto";
import { nanoid } from 'nanoid';

import { sha256 } from "../sub/crypto.js";
import { streamLifespan } from "../config.js";

const streamCache = new NodeCache({ stdTTL: streamLifespan/1000, checkperiod: 10, deleteOnExpire: true });
const streamSalt = randomBytes(64).toString('hex');

streamCache.on("expired", (key) => {
    streamCache.del(key);
});

export function createStream(obj) {
    let streamID = nanoid(),
        exp = Math.floor(new Date().getTime()) + streamLifespan,
        ghmac = sha256(`${streamID},${obj.ip},${obj.service},${exp}`, streamSalt);

    if (!streamCache.has(streamID)) {
        streamCache.set(streamID, {
            id: streamID,
            service: obj.service,
            type: obj.type,
            urls: obj.u,
            filename: obj.filename,
            hmac: ghmac,
            ip: obj.ip,
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

export function verifyStream(ip, id, hmac, exp) {
    try {
        if (id.toString().length === 21) {
            let streamInfo = streamCache.get(id.toString());
            if (!streamInfo) return { error: "requested stream does not exist", status: 400 };
    
            let ghmac = sha256(`${id},${ip},${streamInfo.service},${exp}`, streamSalt);
            if (String(hmac) === ghmac && String(exp) === String(streamInfo.exp) && ghmac === String(streamInfo.hmac)
                && String(ip) === streamInfo.ip && Number(exp) > Math.floor(new Date().getTime())) {
                return streamInfo;
            }
        }
        return { error: "i couldn't verify whether you have access to this download. try again or refresh the page!", status: 401 };
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error" } };
    }
}
