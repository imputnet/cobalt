import { apiJSON } from "../sub/utils.js";
import { verifyStream } from "./manage.js";
import { streamAudioOnly, streamDefault, streamLiveRender, streamVideoOnly } from "./types.js";

export default function(res, ip, id, hmac, exp) {
    try {
        let streamInfo = verifyStream(ip, id, hmac, exp);
        if (streamInfo.error) {
            res.status(streamInfo.status).json(apiJSON(0, { t: streamInfo.error }).body);
            return;
        }
        if (streamInfo.isAudioOnly && streamInfo.type !== "bridge") {
            streamAudioOnly(streamInfo, res);
            return;
        }
        switch (streamInfo.type) {
            case "render":
                streamLiveRender(streamInfo, res);
                break;
            case "mute":
                streamVideoOnly(streamInfo, res);
                break;
            default:
                streamDefault(streamInfo, res);
                break;
        }
    } catch (e) {
        res.status(500).json({ status: "error", text: "Internal Server Error" });
    }
}
