import { createStream } from "../stream/manage.js";

export function apiJSON(type, obj) {
    try {
        switch (type) {
            case 0:
                return { status: 400, body: { status: "error", text: obj.t } };
            case 1:
                return { status: 200, body: { status: "redirect", url: obj.u } };
            case 2:
                return { status: 200, body: { status: "stream", url: createStream(obj) } };
            case 3:
                return { status: 200, body: { status: "success", text: obj.t } };
            case 4:
                return { status: 429, body: { status: "rate-limit", text: obj.t } };
            case 5:
                let pickerType = "various", audio = false
                switch (obj.service) {
                    case "douyin":
                    case "tiktok":
                        audio = createStream(obj)
                        pickerType = "images"
                        break;
                }
                return { status: 200, body: { status: "picker", pickerType: pickerType, url: obj.picker, audio: audio } };
            default:
                return { status: 400, body: { status: "error", text: "Bad Request" } };
        }
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error" } };
    }
}
export function msToTime(d) {
    let milliseconds = parseInt((d % 1000) / 100, 10),
        seconds = parseInt((d / 1000) % 60, 10),
        minutes = parseInt((d / (1000 * 60)) % 60, 10),
        hours = parseInt((d / (1000 * 60 * 60)) % 24, 10),
        r;

    hours = (hours < 10) ? `0${hours}` : hours;
    minutes = (minutes < 10) ? `0${minutes}` : minutes;
    seconds = (seconds < 10) ? `0${seconds}` : seconds;
    r = `${hours}:${minutes}:${seconds}`;
    if (milliseconds) r += `.${milliseconds}`;
    return r;
}
export function cleanURL(url, host) {
    url = url.replace('}', '').replace('{', '').replace(')', '').replace('(', '').replace(' ', '').replace('@', '');
    if (url.includes('youtube.com/shorts/')) {
        url = url.split('?')[0].replace('shorts/', 'watch?v=');
    }
    if (host == "youtube") {
        url = url.split('&')[0];
    } else {
        url = url.split('?')[0];
        if (url.substring(url.length - 1) == "/") {
            url = url.substring(0, url.length - 1);
        }
    }
    return url
}
export function languageCode(req) {
    return req.header('Accept-Language') ? req.header('Accept-Language').slice(0, 2) : "en"
}
export function unicodeDecode(str) {
    return str.replace(/\\u[\dA-F]{4}/gi, (unicode) => {
        return String.fromCharCode(parseInt(unicode.replace(/\\u/g, ""), 16));
    });
}
