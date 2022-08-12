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
import matchActionDecider from "./sub/matchActionDecider.js";

export default async function (host, patternMatch, url, ip, lang, format, quality, audioFormat, isAudioOnly) {
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
                break;
            case "vk":
                r = await vk({
                    userId: patternMatch["userId"],
                    videoId: patternMatch["videoId"],
                    lang: lang, quality: quality
                });
                break;
            case "bilibili":
                r = await bilibili({
                    id: patternMatch["id"].slice(0, 12),
                    lang: lang
                });
                break;
            case "youtube":
                let fetchInfo = {
                    id: patternMatch["id"].slice(0,11),
                    lang: lang, quality: quality,
                    format: "webm"
                };
                if (url.match('music.youtube.com') || isAudioOnly == true) format = "audio";
                switch (format) {
                    case "mp4":
                        fetchInfo["format"] = "mp4";
                        break;
                    case "audio":
                        fetchInfo["format"] = "webm";
                        fetchInfo["isAudioOnly"] = true;
                        fetchInfo["quality"] = "max";
                        isAudioOnly = true;
                        break;
                }
                r = await youtube(fetchInfo);
                break;
            case "reddit":
                r = await reddit({
                    sub: patternMatch["sub"],
                    id: patternMatch["id"],
                    title: patternMatch["title"], lang: lang,
                });
                break;
            case "tiktok":
                r = await tiktok({
                    postId: patternMatch["postId"],
                    id: patternMatch["id"], lang: lang,
                });
                break;
            case "douyin":
                r = await douyin({
                    postId: patternMatch["postId"],
                    id: patternMatch["id"], lang: lang,
                });
                break;
            case "tumblr":
                r = await tumblr({
                    id: patternMatch["id"], url: url, user: patternMatch["user"] ? patternMatch["user"] : false,
                    lang: lang
                });
                break;
            default:
                return apiJSON(0, { t: errorUnsupported(lang) });
        }
        return matchActionDecider(r, host, ip, audioFormat, isAudioOnly)
    } catch (e) {
        return apiJSON(0, { t: genericError(lang, host) })
    }
}
