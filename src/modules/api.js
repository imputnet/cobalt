import UrlPattern from "url-pattern";

import { services as patterns } from "./config.js";

import { cleanURL, apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";

export async function getJSON(originalURL, lang, obj) {
    try {
        let url = decodeURIComponent(originalURL);
        if (url.startsWith('http://')) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }
        let hostname = url.replace("https://", "").replace(' ', '').split('&')[0].split("/")[0].split("."),
            host = hostname[hostname.length - 2],
            patternMatch;

        // TO-DO: bring all tests into one unified module instead of placing them in several places
        switch(host) {
            case "youtu":
                host = "youtube";
                url = `https://youtube.com/watch?v=${url.replace("youtu.be/", "").replace("https://", "")}`;
                break;
            case "goo":
                if (url.substring(0, 30) === "https://soundcloud.app.goo.gl/"){
                    host = "soundcloud"
                    url = `https://soundcloud.com/${url.replace("https://soundcloud.app.goo.gl/", "").split('/')[0]}`
                }
                break;
            case "tumblr":
                if (!url.includes("blog/view")) {
                    if (url.slice(-1) == '/') url = url.slice(0, -1);
                    url = url.replace(url.split('/')[5], '');
                }
                break;
        }
        if (!(host && host.length < 20 && host in patterns && patterns[host]["enabled"])) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }
        for (let i in patterns[host]["patterns"]) {
            patternMatch = new UrlPattern(patterns[host]["patterns"][i]).match(cleanURL(url, host).split(".com/")[1]);
            if (patternMatch) break;
        }
        if (!patternMatch) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }
        return await match(host, patternMatch, url, lang, obj);
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') });
    }
}
