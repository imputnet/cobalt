import stream from "./types.js";

import { closeResponse } from "./shared.js";
import { internalStream } from "./internal.js";

export default async function(res, streamInfo) {
    try {
        switch (streamInfo.type) {
            case "proxy":
                return await stream.proxy(streamInfo, res);

            case "internal":
                return internalStream(streamInfo, res);

            case "merge":
                return stream.merge(streamInfo, res);

            case "remux":
            case "mute":
                return stream.remux(streamInfo, res);

            case "audio":
                return stream.convertAudio(streamInfo, res);

            case "gif":
                return stream.convertGif(streamInfo, res);
        }

        closeResponse(res);
    } catch {
        closeResponse(res);
    }
}
