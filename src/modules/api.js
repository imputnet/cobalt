import UrlPattern from "url-pattern";

import { services as patterns } from "./config.js";

import { cleanURL, apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";
import hostOverrides from "./processing/hostOverrides.js";

export async function getJSON(originalURL, lang, obj) {
    try {
        let patternMatch, url = encodeURI(decodeURIComponent(originalURL)),
            hostname = new URL(url).hostname.split('.'),
            host = hostname[hostname.length - 2];

        if (!url.startsWith('https://')) return apiJSON(0, { t: errorUnsupported(lang) });

        let overrides = hostOverrides(host, url);
        host = overrides.host;
        url = overrides.url;

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
