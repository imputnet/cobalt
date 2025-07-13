import proxy from "./proxy.js";
import ffmpeg from "./ffmpeg.js";

import { closeResponse } from "./shared.js";
import { internalStream } from "./internal.js";

export default async function(res, streamInfo) {
    try {
        console.log(`[STREAM] Processing stream type: ${streamInfo.type}`);
        console.log(`[STREAM] Stream info:`, streamInfo);
        
        switch (streamInfo.type) {
            case "proxy":
                console.log(`[STREAM] Starting proxy...`);
                return await proxy(streamInfo, res);

            case "internal":
                console.log(`[STREAM] Starting internal stream...`);
                return await internalStream(streamInfo.data, res);

            case "merge":
            case "remux":
            case "mute":
                console.log(`[STREAM] Starting ffmpeg ${streamInfo.type}...`);
                return await ffmpeg.remux(streamInfo, res);

            case "audio":
                console.log(`[STREAM] Starting audio conversion...`);
                return await ffmpeg.convertAudio(streamInfo, res);

            case "gif":
                console.log(`[STREAM] Starting gif conversion...`);
                return await ffmpeg.convertGif(streamInfo, res);
        }

        console.log(`[STREAM] Unknown stream type, closing response`);
        closeResponse(res);
    } catch (error) {
        console.log(`[STREAM] Error processing stream:`, error);
        closeResponse(res);
    }
}
