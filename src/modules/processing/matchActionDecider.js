import { audioIgnore, services, supportedAudio } from "../config.js";
import { apiJSON } from "../sub/utils.js";
import loc from "../../localization/manager.js";

export default function(r, host, ip, audioFormat, isAudioOnly, lang, isAudioMuted) {
    let action,
        responseType = 2,
        defaultParams = {
            u: r.urls,
            service: host,
            ip: ip,
            filename: r.filename,
        },
        params = {}

    if (isAudioMuted) action = "muteVideo";
    if (!isAudioOnly && !r.picker && !isAudioMuted) action = "video";
    if (r.picker) action = "picker";
    if (isAudioOnly) action = "audio";

    if (action === "picker" || action === "audio") {
        defaultParams.filename = r.audioFilename;
        defaultParams.isAudioOnly = true;
        defaultParams.audioFormat = audioFormat;
    }

    switch (action) {
        case "video":
            switch (host) {
                case "bilibili":
                    params = { type: "render", time: r.time };
                    break;
                case "youtube":
                    params = { type: r.type, time: r.time };
                    break;
                case "reddit":
                    responseType = r.typeId;
                    params = { type: r.type };
                    break;
                case "vimeo":
                    if (Array.isArray(r.urls)) {
                        params = { type: "render" }
                    } else {
                        responseType = 1;
                    }
                    break;

                case "vk":
                case "douyin":
                case "tiktok":
                    params = { type: "bridge" };
                    break;
                
                case "tumblr":
                case "twitter":
                    responseType = 1;
                    break;
            }
            break;

        case "muteVideo":
            params = {
                type: Array.isArray(r.urls) ? "bridge" : "mute",
                u: Array.isArray(r.urls) ? r.urls[0] : r.urls,
                mute: true
            }
            break;

        case "picker":
            responseType = 5;
            switch (host) {
                case "twitter":
                    params = { picker: r.picker };
                    break;
                case "douyin":
                case "tiktok":
                    let pickerType = "render";
                    if (audioFormat === "mp3" || audioFormat === "best") {
                        audioFormat = "mp3";
                        pickerType = "bridge"
                    }
                    params = {
                        type: pickerType,
                        picker: r.picker,
                        u: Array.isArray(r.urls) ? r.urls[1] : r.urls,
                        copy: audioFormat === "best" ? true : false
                    }
            }
            break;

        case "audio": 
            if ((host === "reddit" && r.typeId === 1) || (host === "vimeo" && !r.filename) || audioIgnore.includes(host)) return apiJSON(0, { t: loc(lang, 'ErrorEmptyDownload') });

            let processType = "render";
            let copy = false;
            
            if (!supportedAudio.includes(audioFormat)) audioFormat = "best";

            if ((host === "tiktok" || host === "douyin") && services.tiktok.audioFormats.includes(audioFormat)) {
                if (r.isMp3) {
                    if (audioFormat === "mp3" || audioFormat === "best") {
                        audioFormat = "mp3";
                        processType = "bridge"
                    }
                } else if (audioFormat === "best") {
                    audioFormat = "m4a";
                    processType = "bridge"
                }
            }

            if ((audioFormat === "best" && services[host]["bestAudio"])
            || services[host]["bestAudio"] && (audioFormat === services[host]["bestAudio"])) {
                audioFormat = services[host]["bestAudio"];
                processType = "bridge"
            } else if (audioFormat === "best") {
                audioFormat = "m4a";
                copy = true;
                if (r.audioFilename.includes("twitterspaces")) {
                    audioFormat = "mp3"
                    copy = false
                }
            }

            params = {
                type: processType,
                u: Array.isArray(r.urls) ? r.urls[1] : r.urls,
                audioFormat: audioFormat,
                copy: copy,
                fileMetadata: r.fileMetadata ? r.fileMetadata : false
            }
            break;
        default:
            return apiJSON(0, { t: loc(lang, 'ErrorEmptyDownload') });
    }

    return apiJSON(responseType, {...defaultParams, ...params})
}
