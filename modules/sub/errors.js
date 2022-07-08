import loc from "./loc.js";

export function internalError(res) {
    res.status(501).json({ status: "error", text: "Internal Server Error" });
}
export function errorUnsupported(lang) {
    return loc(lang, 'apiError', 'notSupported') + loc(lang, 'apiError', 'letMeKnow');
}
export function genericError(lang, host) {
    return loc(lang, 'apiError', 'brokenLink', host) + loc(lang, 'apiError', 'letMeKnow');
}