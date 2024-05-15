import { apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";
import { extract } from "./processing/url.js";

export async function getJSON(url, lang, obj) {
    try {
        const parsed = extract(url);
        if (parsed === null) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }

        return await match(parsed.host, parsed.patternMatch, url, lang, obj)
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') })
    }
}
