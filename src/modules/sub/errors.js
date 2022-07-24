import loc from "../../localization/manager.js";

export function internalError(res) {
    res.status(501).json({ status: "error", text: "Internal Server Error" });
}
export function errorUnsupported(lang) {
    return loc(lang, 'ErrorUnsupported');
}
export function genericError(lang, host) {
    return loc(lang, 'ErrorBrokenLink', host);
}