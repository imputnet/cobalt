import { audioIgnore, services, supportedAudio } from "../config.js"
import { apiJSON } from "./utils.js"

export default function(r, host, ip, audioFormat, isAudioOnly) {
    if (!r.error) {
        if (!isAudioOnly) {
            switch (host) {
                case "twitter":
                    return apiJSON(1, { u: r.urls });
                case "vk":
                    return apiJSON(2, {
                        type: "bridge", u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt
                    });
                case "bilibili":
                    return apiJSON(2, {
                        type: "render", u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt,
                        time: r.time
                    });
                case "youtube":
                    return apiJSON(2, {
                        type: r.type, u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt,
                        time: r.time,
                    });
                case "reddit":
                    return apiJSON(r.typeId, {
                        type: r.type, u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt
                    });
                case "tiktok":
                    return apiJSON(2, {
                        type: "bridge", u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt
                    });
                case "douyin":
                    return apiJSON(2, {
                        type: "bridge", u: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt
                    });
                case "tumblr":
                    return apiJSON(1, { u: r.urls });
                case "vimeo":
                    return apiJSON(1, { u: r.urls });
            }
        } else {
            if (host == "reddit" && r.typeId == 1 || audioIgnore.includes(host)) return apiJSON(0, { t: r.audioFilename });

            let type = "render";
            let copy = false;
            if (!supportedAudio.includes(audioFormat)) audioFormat = "best";

            if ((host == "tiktok" || host == "douyin") && isAudioOnly && services.tiktok.audioFormats.includes(audioFormat)) {
                if (r.isMp3) {
                    if (audioFormat == "mp3" || audioFormat == "best") {
                        audioFormat = "mp3"
                        type = "bridge"
                    }
                } else if (audioFormat == "best") {
                    audioFormat = "m4a"
                    type = "bridge"
                }
            }

            if ((audioFormat == "best" && services[host]["bestAudio"]) || services[host]["bestAudio"] && (audioFormat == services[host]["bestAudio"])) {
                audioFormat = services[host]["bestAudio"]
                type = "bridge"
            } else if (audioFormat == "best") {
                audioFormat = "m4a"
                copy = true
            }
            if ((host == "tiktok" || host == "douyin") && r.images) {
                return apiJSON(5, {
                    type: type,
                    images: r.images,
                    u: Array.isArray(r.urls) ? r.urls[1] : r.urls, service: host, ip: ip,
                    filename: r.audioFilename, salt: process.env.streamSalt, isAudioOnly: true, audioFormat: audioFormat, copy: copy
                })
            } else {
                return apiJSON(2, {
                    type: type,
                    u: Array.isArray(r.urls) ? r.urls[1] : r.urls, service: host, ip: ip,
                    filename: r.audioFilename, salt: process.env.streamSalt, isAudioOnly: true, audioFormat: audioFormat, copy: copy
                })
            }
        }
    } else {
        return apiJSON(0, { t: r.error });
    }
}
