import createFilename from "./create-filename.js";

import { createResponse } from "./request.js";
import { audioIgnore } from "./service-config.js";
import { createStream } from "../stream/manage.js";

export default function({ r, host, audioFormat, isAudioOnly, isAudioMuted, disableMetadata, filenameStyle, twitterGif, requestIP, audioBitrate, alwaysProxy }) {
    let action,
        responseType = "tunnel",
        defaultParams = {
            u: r.urls,
            headers: r.headers,
            service: host,
            filename: r.filenameAttributes ?
                    createFilename(r.filenameAttributes, filenameStyle, isAudioOnly, isAudioMuted) : r.filename,
            fileMetadata: !disableMetadata ? r.fileMetadata : false,
            requestIP
        },
        params = {};

    if (r.isPhoto) action = "photo";
    else if (r.picker) action = "picker"
    else if (r.isGif && twitterGif) action = "gif";
    else if (isAudioOnly) action = "audio";
    else if (isAudioMuted) action = "muteVideo";
    else if (r.isM3U8) action = "m3u8";
    else action = "video";

    if (action === "picker" || action === "audio") {
        if (!r.filenameAttributes) defaultParams.filename = r.audioFilename;
        defaultParams.audioFormat = audioFormat;
    }

    if (action === "muteVideo" && isAudioMuted && !r.filenameAttributes) {
        const parts = r.filename.split(".");
        const ext = parts.pop();

        defaultParams.filename = `${parts.join(".")}_mute.${ext}`;
    }

    switch (action) {
        default:
            return createResponse("error", {
                code: "error.api.fetch.empty"
            });

        case "photo":
            responseType = "redirect";
            break;

        case "gif":
            params = { type: "gif" };
            break;

        case "m3u8":
            params = {
                type: Array.isArray(r.urls) ? "merge" : "remux"
            }
            break;

        case "muteVideo":
            let muteType = "mute";
            if (Array.isArray(r.urls) && !r.isM3U8) {
                muteType = "proxy";
            }
            params = {
                type: muteType,
                u: Array.isArray(r.urls) ? r.urls[0] : r.urls
            }
            if (host === "reddit" && r.typeId === "redirect") {
                responseType = "redirect";
            }
            break;

        case "picker":
            responseType = "picker";
            switch (host) {
                case "instagram":
                case "twitter":
                case "snapchat":
                case "bsky":
                    params = { picker: r.picker };
                    break;

                case "tiktok":
                    let audioStreamType = "audio";
                    if (r.bestAudio === "mp3" && audioFormat === "best") {
                        audioFormat = "mp3";
                        audioStreamType = "proxy"
                    }
                    params = {
                        picker: r.picker,
                        u: createStream({
                            service: "tiktok",
                            type: audioStreamType,
                            u: r.urls,
                            headers: r.headers,
                            filename: r.audioFilename,
                            isAudioOnly: true,
                            audioFormat,
                        })
                    }
                    break;
            }
            break;

        case "video":
            switch (host) {
                case "bilibili":
                    params = { type: "merge" };
                    break;

                case "youtube":
                    params = { type: r.type };
                    break;

                case "reddit":
                    responseType = r.typeId;
                    params = { type: r.type };
                    break;

                case "vimeo":
                    if (Array.isArray(r.urls)) {
                        params = { type: "merge" }
                    } else {
                        responseType = "redirect";
                    }
                    break;

                case "twitter":
                    if (r.type === "remux") {
                        params = { type: r.type };
                    } else {
                        responseType = "redirect";
                    }
                    break;

                case "vk":
                case "tiktok":
                    params = { type: "proxy" };
                    break;

                case "facebook":
                case "vine":
                case "instagram":
                case "tumblr":
                case "pinterest":
                case "streamable":
                case "snapchat":
                case "loom":
                    responseType = "redirect";
                    break;
            }
            break;

        case "audio":
            if (audioIgnore.includes(host) || (host === "reddit" && r.typeId === "redirect")) {
                return createResponse("error", {
                    code: "error.api.fetch.empty"
                })
            }

            let processType = "audio";
            let copy = false;

            if (audioFormat === "best") {
                const serviceBestAudio = r.bestAudio;

                if (serviceBestAudio) {
                    audioFormat = serviceBestAudio;
                    processType = "proxy";

                    if (host === "soundcloud") {
                        processType = "audio";
                        copy = true;
                    }
                } else {
                    audioFormat = "m4a";
                    copy = true;
                }
            }

            if (r.isM3U8 || host === "vimeo") {
                copy = false;
                processType = "audio";
            }

            params = {
                type: processType,
                u: Array.isArray(r.urls) ? r.urls[1] : r.urls,

                audioBitrate,
                audioCopy: copy,
                audioFormat,
            }
            break;
    }

    if (defaultParams.filename && (action === "picker" || action === "audio")) {
        defaultParams.filename += `.${audioFormat}`;
    }

    if (alwaysProxy && responseType === "redirect") {
        responseType = "tunnel";
        params.type = "proxy";
    }

    return createResponse(responseType, {...defaultParams, ...params})
}
