import loc from "./i18n.js";

export function internalError(res) {
    res.status(501).json({ status: "error", text: "Internal Server Error" });
}
export function errorUnsupported(lang) {
    return loc(lang, 'apiError', 'notSupported');
}
export function genericError(lang, host) {
    return loc(lang, 'apiError', 'brokenLink', host);
}