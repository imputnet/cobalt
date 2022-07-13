import { supportedLanguages, appName, repo } from "../config.js";
import loadJson from "./load-json.js";

export default function(lang, cat, string, replacement) {
    if (!supportedLanguages.includes(lang)) {
        lang = 'en'
    }
    try {
        let str = loadJson(`./strings/${lang}/${cat}.json`);
        if (str && str[string]) {
            let s = str[string].replace(/\n/g, '<br/>').replace(/{appName}/g, appName).replace(/{repo}/g, repo)
            if (replacement) {
                s = s.replace(/{s}/g, replacement)
            }
            return s + ' '
        } else {
            return string
        }
    } catch (e) {
        return string
    }
}
