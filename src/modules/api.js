import { services } from "./config.js";

import { apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";
import { hasValidHostname, normalizeURL } from "./processing/url.js";

export async function getJSON(originalURL, lang, obj) {
    try {
        const url = normalizeURL(decodeURIComponent(originalURL));

        if (!hasValidHostname(url) || !services[host].enabled) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }

        let patternMatch;
        for (const pattern of services[host].patterns) {
            patternMatch = pattern.match(
                url.pathname.substring(1) + url.search
            );
            if (patternMatch) break;
        }

        if (!patternMatch) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }

        return await match(host, patternMatch, url.toString(), lang, obj)
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') })
    }
}
