import UrlPattern from "url-pattern";

import { services as patterns } from "./config.js";

import { cleanURL, apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";

export async function getJSON(originalURL, lang, obj) {
    try {
        let patternMatch, url = decodeURIComponent(originalURL),
            hostname = new URL(url).hostname.split('.'),
            host = hostname[hostname.length - 2];

        if (!url.startsWith('https://')) return apiJSON(0, { t: errorUnsupported(lang) });

        switch(host) {
            case "youtu":
                if (url.startsWith("https://youtu.be/")) {
                    host = "youtube";
                    url = `https://youtube.com/watch?v=${url.replace("https://youtu.be/", "")}`;
                }
                break;
            case "goo":
                if (url.substring(0, 30) === "https://soundcloud.app.goo.gl/") {
                    host = "soundcloud";
                    url = `https://soundcloud.com/${url.replace("https://soundcloud.app.goo.gl/", "").split('/')[0]}`
                }
                break;
            case "x":
                if (url.startsWith("https://x.com/")) {
                    host = "twitter";
                    url = url.replace("https://x.com/", "https://twitter.com/")
                }
                break;
            case "tumblr":
                if (!url.includes("blog/view")) {
                    if (url.slice(-1) === '/') url = url.slice(0, -1);
                    url = url.replace(url.split('/')[5], '')
                }
                break;
        }
        if (!(host && host.length < 20 && host in patterns && patterns[host]["enabled"])) return apiJSON(0, { t: errorUnsupported(lang) });

        let pathToMatch = cleanURL(url, host).split(`.${patterns[host]['tld'] ? patterns[host]['tld'] : "com"}/`)[1].replace('.', '');
        for (let i in patterns[host]["patterns"]) {
            patternMatch = new UrlPattern(patterns[host]["patterns"][i]).match(pathToMatch);
            if (patternMatch) break
        }
        if (!patternMatch) return apiJSON(0, { t: errorUnsupported(lang) });

        return await match(host, patternMatch, url, lang, obj)
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') })
    }
}
