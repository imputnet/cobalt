import { apiJSON } from "./sub/api-helper.js";
import { errorUnsupported, genericError } from "./sub/errors.js";

import bilibili from "./services/bilibili.js";
import reddit from "./services/reddit.js";
import twitter from "./services/twitter.js";
import youtube from "./services/youtube.js";
import vk from "./services/vk.js";

export default async function (host, patternMatch, url, ip, lang, format, quality) {
    try {
        switch (host) {
            case "twitter":
                if (patternMatch["id"] && patternMatch["id"].length < 20) {
                    let r = await twitter({
                        id: patternMatch["id"],
                        lang: lang
                    });
                    return (!r.error) ? apiJSON(1, { u: r.split('?')[0] }) : apiJSON(0, { t: r.error })
                } else throw Error()
            case "vk":
                if (patternMatch["userId"] && patternMatch["videoId"] && patternMatch["userId"].length <= 10 && patternMatch["videoId"].length == 9) {
                    let r = await vk({
                        userId: patternMatch["userId"],
                        videoId: patternMatch["videoId"],
                        lang: lang, quality: quality
                    });
                    return (!r.error) ? apiJSON(2, { type: "bridge", urls: r.url, filename: r.filename, service: host, ip: ip, salt: process.env.streamSalt }) : apiJSON(0, { t: r.error });
                } else throw Error()
            case "bilibili":
                if (patternMatch["id"] && patternMatch["id"].length >= 12) {
                    let r = await bilibili({
                        id: patternMatch["id"].slice(0, 12),
                        lang: lang
                    });
                    return (!r.error) ? apiJSON(2, {
                        type: "render", urls: r.urls,
                        service: host, ip: ip,
                        filename: r.filename,
                        salt: process.env.streamSalt, time: r.time
                    }) : apiJSON(0, { t: r.error });
                } else throw Error()
            case "youtube":
                if (patternMatch["id"] && patternMatch["id"].length >= 11) {
                    let fetchInfo = {
                        id: patternMatch["id"].slice(0,11),
                        lang: lang, quality: quality,
                        format: "mp4"
                    };
                    if (url.match('music.youtube.com')) {
                        format = "audio"
                    }
                    switch (format) {
                        case "webm":
                            fetchInfo["format"] = "webm";
                            break;
                        case "audio":
                            fetchInfo["format"] = "webm";
                            fetchInfo["isAudioOnly"] = true;
                            fetchInfo["quality"] = "max";
                            break;
                    }
                    let r = await youtube(fetchInfo);
                    return (!r.error) ? apiJSON(2, {
                        type: r.type, urls: r.urls, service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt,
                        isAudioOnly: fetchInfo["isAudioOnly"] ? fetchInfo["isAudioOnly"] : false,
                        time: r.time,
                    }) : apiJSON(0, { t: r.error });
                } else throw Error()
            case "reddit":
                if (patternMatch["sub"] && patternMatch["id"] && patternMatch["title"] && patternMatch["sub"].length <= 22 && patternMatch["id"].length <= 10 && patternMatch["title"].length <= 96) {
                    let r = await reddit({
                        sub: patternMatch["sub"],
                        id: patternMatch["id"],
                        title: patternMatch["title"]
                    });
                    return (!r.error) ? apiJSON(2, {
                        type: "render", urls: r.urls,
                        service: host, ip: ip,
                        filename: r.filename, salt: process.env.streamSalt
                    }) : apiJSON(0, { t: r.error });
                } else throw Error()
            default:
                return apiJSON(0, { t: errorUnsupported(lang) })
        }
    } catch (e) {
        return apiJSON(0, { t: genericError(lang, host) })
    }
}