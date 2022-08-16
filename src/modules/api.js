import UrlPattern from "url-pattern";

import { services as patterns } from "./config.js";

import { cleanURL, apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./match.js";

export async function getJSON(originalURL, ip, lang, format, quality, audioFormat, isAudioOnly, noWatermark) {
    try {
        let url = decodeURI(originalURL);
        if (!url.includes('http://')) {
            let hostname = url.replace("https://", "").replace(' ', '').split('&')[0].split("/")[0].split("."),
                host = hostname[hostname.length - 2],
                patternMatch;
            if (host == "youtu") {
                host = "youtube";
                url = `https://youtube.com/watch?v=${url.replace("youtu.be/", "").replace("https://", "")}`;
            }
            if (host == "tumblr" && !url.includes("blog/view")) {
                if (url.slice(-1) == '/') url = url.slice(0, -1);
                url = url.replace(url.split('/')[5], '');
            }
            if (host && host.length < 20 && host in patterns && patterns[host]["enabled"]) {
                for (let i in patterns[host]["patterns"]) {
                    patternMatch = new UrlPattern(patterns[host]["patterns"][i]).match(cleanURL(url, host).split(".com/")[1]);
                    if (patternMatch) break;
                }
                if (patternMatch) {
                    return await match(host, patternMatch, url, ip, lang, format, quality, audioFormat, isAudioOnly, noWatermark);
                } return apiJSON(0, { t: errorUnsupported(lang) })
            } return apiJSON(0, { t: errorUnsupported(lang) })
        } else {
            return apiJSON(0, { t: errorUnsupported(lang) })
        }
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') });
    }
}
