import loc from "../../localization/manager.js";

export function errorUnsupported(lang) {
    return loc(lang, 'ErrorUnsupported');
}
export function genericError(lang, host) {
    return loc(lang, 'ErrorBrokenLink', host);
}
