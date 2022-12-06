import { audioIgnore, services, supportedAudio } from "../config.js"
import { apiJSON } from "../sub/utils.js"
import loc from "../../localization/manager.js";

export default function(r, host, ip, audioFormat, isAudioOnly, lang) {
    if (!isAudioOnly && !r.picker) {
        switch (host) {
            case "twitter":
                return apiJSON(1, { u: r.urls });
            case "vk":
                return apiJSON(2, {
                    type: "bridge", u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                });
            case "bilibili":
                return apiJSON(2, {
                    type: "render", u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                    time: r.time
                });
            case "youtube":
                return apiJSON(2, {
                    type: r.type, u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                    time: r.time,
                });
            case "reddit":
                return apiJSON(r.typeId, {
                    type: r.type, u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                });
            case "tiktok":
                return apiJSON(2, {
                    type: "bridge", u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                });
            case "douyin":
                return apiJSON(2, {
                    type: "bridge", u: r.urls, service: host, ip: ip,
                    filename: r.filename,
                });
            case "tumblr":
                return apiJSON(1, { u: r.urls });
            case "vimeo":
                if (r.filename) {
                    return apiJSON(2, {
                        type: "render", u: r.urls, service: host, ip: ip,
                        filename: r.filename
                    });
                } else {
                    return apiJSON(1, { u: r.urls });
                }
        }
    } else if (r.picker) {
        switch (host) {
            case "douyin":
            case "tiktok":
                let type = "render";
                if (audioFormat === "mp3" || audioFormat === "best") {
                    audioFormat = "mp3"
                    type = "bridge"
                }
                return apiJSON(5, {
                    type: type,
                    picker: r.picker,
                    u: Array.isArray(r.urls) ? r.urls[1] : r.urls, service: host, ip: ip,
                    filename: r.audioFilename, isAudioOnly: true, audioFormat: audioFormat, copy: audioFormat === "best" ? true : false,
                })
            case "twitter":
                return apiJSON(5, {
                    picker: r.picker, service: host
                })
        }
    } else {
        if ((host === "reddit" && r.typeId === 1) || (host === "vimeo" && !r.filename) || audioIgnore.includes(host)) return apiJSON(0, { t: loc(lang, 'ErrorEmptyDownload') });
        let type = "render";
        let copy = false;
        
        if (!supportedAudio.includes(audioFormat)) audioFormat = "best";
        if ((host == "tiktok" || host == "douyin") && isAudioOnly && services.tiktok.audioFormats.includes(audioFormat)) {
            if (r.isMp3) {
                if (audioFormat === "mp3" || audioFormat === "best") {
                    audioFormat = "mp3"
                    type = "bridge"
                }
            } else if (audioFormat === "best") {
                audioFormat = "m4a"
                type = "bridge"
            }
        }
        if ((audioFormat === "best" && services[host]["bestAudio"]) || services[host]["bestAudio"] && (audioFormat === services[host]["bestAudio"])) {
            audioFormat = services[host]["bestAudio"]
            type = "bridge"
        } else if (audioFormat === "best") {
            audioFormat = "m4a"
            copy = true
            if (r.audioFilename.includes("twitterspaces")) {
                audioFormat = "mp3"
                copy = false
            }
        }
        return apiJSON(2, {
            type: type,
            u: Array.isArray(r.urls) ? r.urls[1] : r.urls, service: host, ip: ip,
            filename: r.audioFilename, isAudioOnly: true,
            audioFormat: audioFormat, copy: copy, fileMetadata: r.fileMetadata ? r.fileMetadata : false
        })
    }
}
