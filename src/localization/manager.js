import * as fs from "fs";
import { links, repo } from "../modules/config.js";
import { loadJSON } from "../modules/sub/loadFromFs.js";

const locPath = './src/localization/languages';

let loc = {}
let languages = [];

export async function loadLoc() {
    const files = await fs.promises.readdir(locPath).catch((e) => { return [] });
    files.forEach(file => {
        loc[file.split('.')[0]] = loadJSON(`${locPath}/${file}`);
        languages.push(file.split('.')[0])
    });
}

export function replaceBase(s) {
    return s
            .replace(/\n/g, '<br>')
            .replace(/{saveToGalleryShortcut}/g, links.saveToGalleryShortcut)
            .replace(/{repo}/g, repo)
            .replace(/{statusPage}/g, links.statusPage)
            .replace(/\*;/g, "&bull;");
}
export function replaceAll(lang, str, string, replacement) {
    let s = replaceBase(str[string])
    if (replacement) s = s.replace(/{s}/g, replacement);
    if (s.match('{')) {
        Object.keys(loc[lang]["substrings"]).forEach(sub => {
            s = replaceBase(s.replace(`{${sub}}`, loc[lang]["substrings"][sub]))
        });
    }
    return s
}
export default function(lang, string, replacement) {
    try {
        if (!Object.keys(loc).includes(lang)) lang = 'en';
        let str = loc[lang]["strings"];
        if (str && str[string]) {
            return replaceAll(lang, str, string, replacement)
        } else {
            str = loc["en"]["strings"];
            return replaceAll(lang, str, string, replacement)
        }
    } catch (e) {
        return `!!${string}!!`
    }
}
export const languageList = languages;
