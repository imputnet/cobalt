import { streamAudioOnly, streamDefault, streamLiveRender, streamVideoOnly, convertToGif } from "./types.js";
import { internalStream } from './internal.js';

export default async function(res, streamInfo) {
    try {
        if (streamInfo.isAudioOnly && streamInfo.type !== "bridge") {
            streamAudioOnly(streamInfo, res);
            return;
        }
        switch (streamInfo.type) {
            case "internal":
                return await internalStream(streamInfo, res);
            case "render":
                await streamLiveRender(streamInfo, res);
                break;
            case "gif":
                convertToGif(streamInfo, res);
                break;
            case "remux":
            case "mute":
                streamVideoOnly(streamInfo, res);
                break;
            default:
                await streamDefault(streamInfo, res);
                break;
        }
    } catch {
        res.status(500).json({ status: "error", text: "Internal Server Error" });
    }
}
