import ipaddr from "ipaddr.js";

import { normalizeURL } from "./url.js";
import { createStream } from "../stream/manage.js";
import { verifyLanguageCode } from "../misc/utils.js";

const apiRequest = {
    option: {
        audioFormat: ["best", "mp3", "ogg", "wav", "opus"],
        downloadMode: ["auto", "audio", "mute"],
        filenameStyle: ["classic", "pretty", "basic", "nerdy"],
        videoQuality: ["max", "4320", "2160", "1440", "1080", "720", "480", "360", "240", "144"],
        youtubeVideoCodec: ["h264", "av1", "vp9"],
    },
    boolean: [
        "disableMetadata",
        "tiktokFullAudio",
        "tiktokH265",
        "twitterGif",
        "youtubeDubBrowserLang",
        "youtubeDubLang"
    ]
}

export function createResponse(responseType, responseData) {
    const internalError = (code) => {
        return {
            status: 500,
            body: {
                status: "error",
                error: {
                    code: code || "Internal Server Error",
                },
                critical: true
            }
        }
    }

    try {
        let status = 200,
            response = {};

        if (responseType === "error") {
            status = 400;
        }

        switch (responseType) {
            case "error":
                response = {
                    error: {
                        code: responseData.code,
                        context: responseData?.context,
                    }
                }
                break;
            case "redirect":
                response = {
                    url: responseData.u,
                }
                break;

            case "stream":
                response = {
                    url: createStream(responseData),
                }
                break;

            case "picker":
                let pickerType = "various",
                    audio = false;

                if (responseData.service === "tiktok") {
                    audio = responseData.u;
                    pickerType = "images";
                }

                response = {
                    pickerType: pickerType,
                    picker: responseData.picker,
                    audio: audio,
                }
                break;
            case "critical":
                return internalError(responseData.code);
            default:
                throw "unreachable"
        }
        return {
            status,
            body: {
                status: responseType,
                ...response
            }
        }
    } catch {
        return internalError()
    }
}

export function normalizeRequest(request) {
    try {
        let template = {
            audioFormat: "mp3",
            url: normalizeURL(decodeURIComponent(request.url)),
            youtubeVideoCodec: "h264",
            videoQuality: "720",
            filenameStyle: "classic",
            downloadMode: "auto",
            tiktokFullAudio: false,
            disableMetadata: false,
            youtubeDubBrowserLang: false,
            youtubeDubLang: false,
            twitterGif: false,
            tiktokH265: false
        }

        const requestKeys = Object.keys(request);
        const templateKeys = Object.keys(template);

        if (requestKeys.length > templateKeys.length + 1 || !request.url) {
            return false;
        }

        for (const i in requestKeys) {
            const key = requestKeys[i];
            const item = request[key];

            if (String(key) !== "url" && templateKeys.includes(key)) {
                if (apiRequest.boolean.includes(key)) {
                    template[key] = !!item;
                } else if (apiRequest.option[key] && apiRequest.option[key].includes(item)) {
                    template[key] = String(item)
                }
            }
        }

        if (template.youtubeDubBrowserLang)
            template.youtubeDubLang = verifyLanguageCode(request.youtubeDubLang);

        return template
    } catch {
        return false
    }
}

export function getIP(req) {
    const strippedIP = req.ip.replace(/^::ffff:/, '');
    const ip = ipaddr.parse(strippedIP);
    if (ip.kind() === 'ipv4') {
        return strippedIP;
    }

    const prefix = 56;
    const v6Bytes = ip.toByteArray();
          v6Bytes.fill(0, prefix / 8);

    return ipaddr.fromByteArray(v6Bytes).toString();
}
