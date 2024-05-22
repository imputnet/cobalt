import ipaddr from "ipaddr.js";

import { normalizeURL } from "../processing/url.js";
import { createStream } from "../stream/manage.js";
import { verifyLanguageCode } from "../sub/utils.js";

const apiVar = {
    allowed: {
        vCodec: ["h264", "av1", "vp9"],
        vQuality: ["max", "4320", "2160", "1440", "1080", "720", "480", "360", "240", "144"],
        aFormat: ["best", "mp3", "ogg", "wav", "opus"],
        filenamePattern: ["classic", "pretty", "basic", "nerdy"]
    },
    booleanOnly: [
        "isAudioOnly",
        "isTTFullAudio",
        "isAudioMuted",
        "dubLang",
        "disableMetadata",
        "twitterGif",
        "tiktokH265"
    ]
}

export function createResponse(responseType, responseData) {
    const internalError = (text) => {
        return {
            status: 500,
            body: {
                status: "error",
                text: text || "Internal Server Error",
                critical: true
            }
        }
    }

    try {
        let status = 200,
            response = {};
        
        switch(responseType) {
            case "error":
                status = 400;
                break;

            case "rate-limit":
                status = 429;
                break;
        }

        switch (responseType) {
            case "error":
            case "success":
            case "rate-limit":
                response = {
                    text: responseData.t
                }
                break;

            case "redirect":
                response = {
                    url: responseData.u
                }
                break;

            case "stream":
                response = {
                    url: createStream(responseData)
                }
                break;

            case "picker":
                let pickerType = "various",
                    audio = false;

                if (responseData.service === "tiktok") {
                    audio = responseData.u
                    pickerType = "images"
                }

                response = {
                    pickerType: pickerType,
                    picker: responseData.picker,
                    audio: audio
                }
                break;
            case "critical": 
                return internalError(responseData.t)
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
            url: normalizeURL(decodeURIComponent(request.url)),
            vCodec: "h264",
            vQuality: "720",
            aFormat: "mp3",
            filenamePattern: "classic",
            isAudioOnly: false,
            isTTFullAudio: false,
            isAudioMuted: false,
            disableMetadata: false,
            dubLang: false,
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
                if (apiVar.booleanOnly.includes(key)) {
                    template[key] = !!item;
                } else if (apiVar.allowed[key] && apiVar.allowed[key].includes(item)) {
                    template[key] = String(item)
                }
            }
        }

        if (template.dubLang)
            template.dubLang = verifyLanguageCode(request.dubLang);

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
