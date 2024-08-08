import createFilename from "./create-filename.js";

import { createResponse } from "./request.js";
import { audioIgnore } from "./service-config.js";
import { createStream } from "../stream/manage.js";
import { splitFilenameExtension } from "../misc/utils.js";
import { convertLanguageCode } from "../misc/language-codes.js";

const extraProcessingTypes = new Set(["merge", "remux", "mute", "audio", "gif"]);

export default function({
    r,
    host,
    audioFormat,
    isAudioOnly,
    isAudioMuted,
    disableMetadata,
    filenameStyle,
    convertGif,
    requestIP,
    audioBitrate,
    alwaysProxy,
    localProcessing,
}) {
    let action,
        responseType = "tunnel",
        defaultParams = {
            url: r.urls,
            headers: r.headers,
            service: host,
            filename: r.filenameAttributes ?
                    createFilename(r.filenameAttributes, filenameStyle, isAudioOnly, isAudioMuted) : r.filename,
            fileMetadata: !disableMetadata ? r.fileMetadata : false,
            requestIP,
            originalRequest: r.originalRequest,
            subtitles: r.subtitles,
            cover: !disableMetadata ? r.cover : false,
            cropCover: !disableMetadata ? r.cropCover : false,
        },
        params = {};

    if (r.isPhoto) action = "photo";
    else if (r.picker) action = "picker"
    else if (r.isGif && convertGif) action = "gif";
    else if (isAudioOnly) action = "audio";
    else if (isAudioMuted) action = "muteVideo";
    else if (r.isHLS) action = "hls";
    else action = "video";

    if (action === "picker" || action === "audio") {
        if (!r.filenameAttributes) defaultParams.filename = r.audioFilename;
        defaultParams.audioFormat = audioFormat;
    }

    if (action === "muteVideo" && isAudioMuted && !r.filenameAttributes) {
        const [ name, ext ] = splitFilenameExtension(r.filename);
        defaultParams.filename = `${name}_mute.${ext}`;
    } else if (action === "gif") {
        const [ name ] = splitFilenameExtension(r.filename);
        defaultParams.filename = `${name}.gif`;
    }

    switch (action) {
        default:
            return createResponse("error", {
                code: "error.api.fetch.empty"
            });

        case "photo":
            params = { type: "proxy" };
            break;

        case "gif":
            params = { type: "gif" };
            break;

        case "hls":
            params = {
                type: Array.isArray(r.urls) ? "merge" : "remux",
                isHLS: true,
            }
            break;

        case "muteVideo":
            let muteType = "mute";
            if (Array.isArray(r.urls) && !r.isHLS) {
                muteType = "proxy";
            }
            params = {
                type: muteType,
                url: Array.isArray(r.urls) ? r.urls[0] : r.urls,
                isHLS: r.isHLS
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
                case "xiaohongshu":
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
                        url: createStream({
                            service: "tiktok",
                            type: audioStreamType,
                            url: r.urls,
                            headers: r.headers,
                            filename: `${r.audioFilename}.${audioFormat}`,
                            isAudioOnly: true,
                            audioFormat,
                            audioBitrate
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
                        params = { type: "merge" };
                    } else if (r.subtitles) {
                        params = { type: "remux" };
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

                case "loom":
                    if (r.subtitles) {
                        params = { type: "remux" };
                    } else {
                        responseType = "redirect";
                    }
                    break;

                case "vk":
                case "tiktok":
                    params = {
                        type: r.subtitles ? "remux" : "proxy"
                    };
                    break;

                case "ok":
                case "xiaohongshu":
                case "newgrounds":
                    params = { type: "proxy" };
                    break;

                case "facebook":
                case "instagram":
                case "tumblr":
                case "pinterest":
                case "streamable":
                case "snapchat":
                case "twitch":
                    responseType = "redirect";
                    break;
            }
            break;

        case "audio":
            if (audioIgnore.has(host) || (host === "reddit" && r.typeId === "redirect")) {
                return createResponse("error", {
                    code: "error.api.service.audio_not_supported"
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

            if (r.isHLS || host === "vimeo") {
                copy = false;
                processType = "audio";
            }

            params = {
                type: processType,
                url: Array.isArray(r.urls) ? r.urls[1] : r.urls,

                audioBitrate,
                audioCopy: copy,
                audioFormat,

                isHLS: r.isHLS,
            }
            break;
    }

    if (defaultParams.filename && (action === "picker" || action === "audio")) {
        defaultParams.filename += `.${audioFormat}`;
    }

    // alwaysProxy is set to true in match.js if localProcessing is forced
    if (alwaysProxy && responseType === "redirect") {
        responseType = "tunnel";
        params.type = "proxy";
    }

    // TODO: add support for HLS
    // (very painful)
    if (!params.isHLS && responseType !== "picker") {
        const isPreferredWithExtra =
            localProcessing === "preferred" && extraProcessingTypes.has(params.type);

        if (localProcessing === "forced" || isPreferredWithExtra) {
            responseType = "local-processing";
        }
    }

    // extractors usually return ISO 639-1 language codes,
    // but video players expect ISO 639-2, so we convert them here
    const sublanguage = defaultParams.fileMetadata?.sublanguage;
    if (sublanguage && sublanguage.length !== 3) {
        const code = convertLanguageCode(sublanguage);
        if (code) {
            defaultParams.fileMetadata.sublanguage = code;
        } else {
            // if a language code couldn't be converted,
            // then we don't want it at all
            delete defaultParams.fileMetadata.sublanguage;
        }
    }

    return createResponse(
        responseType,
        { ...defaultParams, ...params }
    );
}
