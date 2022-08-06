import { apiJSON } from "./sub/utils.js";
import { errorUnsupported, genericError } from "./sub/errors.js";

import { testers } from "./servicesPatternTesters.js";

import bilibili from "./services/bilibili.js";
import reddit from "./services/reddit.js";
import twitter from "./services/twitter.js";
import youtube from "./services/youtube.js";
import vk from "./services/vk.js";
import tiktok from "./services/tiktok.js";
import douyin from "./services/douyin.js";
import tumblr from "./services/tumblr.js";

export default async function (host, patternMatch, url, ip, lang, format, quality) {
    try {
        if (!testers[host]) return apiJSON(0, { t: errorUnsupported(lang) });
        if (!(testers[host](patternMatch))) throw Error();

        let r;
        switch (host) {
            case "twitter":
                r = await twitter({
                    id: patternMatch["id"],
                    lang: lang
                });
                return (!r.error) ? apiJSON(1, { u: r }) : apiJSON(0, { t: r.error });

            case "vk":
                r = await vk({
                    userId: patternMatch["userId"],
                    videoId: patternMatch["videoId"],
                    lang: lang, quality: quality
                });
                return (!r.error) ? apiJSON(2, { type: "bridge", lang: lang, u: r.url, filename: r.filename,
                service: host, ip: ip, salt: process.env.streamSalt }) : apiJSON(0, { t: r.error });
                
            case "bilibili":
                r = await bilibili({
                    id: patternMatch["id"].slice(0, 12),
                    lang: lang
                });
                return (!r.error) ? apiJSON(2, {
                    type: "render", u: r.urls, lang: lang,
                    service: host, ip: ip,
                    filename: r.filename,
                    salt: process.env.streamSalt, time: r.time
                }) : apiJSON(0, { t: r.error });

            case "youtube":
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
                r = await youtube(fetchInfo);
                return (!r.error) ? apiJSON(2, {
                    type: r.type, u: r.urls, lang: lang, service: host, ip: ip,
                    filename: r.filename, salt: process.env.streamSalt,
                    isAudioOnly: fetchInfo["isAudioOnly"] ? fetchInfo["isAudioOnly"] : false,
                    time: r.time,
                }) : apiJSON(0, { t: r.error });

            case "reddit":
                r = await reddit({
                    sub: patternMatch["sub"],
                    id: patternMatch["id"],
                    title: patternMatch["title"], lang: lang,
                });
                return (!r.error) ? apiJSON(r.typeId, {
                    type: r.type, u: r.urls, lang: lang,
                    service: host, ip: ip,
                    filename: r.filename, salt: process.env.streamSalt
                }) : apiJSON(0, { t: r.error });

            case "tiktok":
                r = await tiktok({
                    postId: patternMatch["postId"],
                    id: patternMatch["id"], lang: lang,
                });
                return (!r.error) ? apiJSON(2, {
                    type: "bridge", u: r.urls, lang: lang,
                    service: host, ip: ip,
                    filename: r.filename, salt: process.env.streamSalt
                }) : apiJSON(0, { t: r.error });

            case "douyin":
                r = await douyin({
                    postId: patternMatch["postId"],
                    id: patternMatch["id"], lang: lang,
                });
                return (!r.error) ? apiJSON(2, {
                    type: "bridge", u: r.urls, lang: lang,
                    service: host, ip: ip,
                    filename: r.filename, salt: process.env.streamSalt
                }) : apiJSON(0, { t: r.error });

            case "tumblr":
                r = await tumblr({
                    id: patternMatch["id"], url: url, user: patternMatch["user"] ? patternMatch["user"] : false,
                    lang: lang
                });
                return (!r.error) ? apiJSON(1, { u: r.split('?')[0] }) : apiJSON(0, { t: r.error });
            default:
                return apiJSON(0, { t: errorUnsupported(lang) });
        }
    } catch (e) {
        return apiJSON(0, { t: genericError(lang, host) })
    }
}
