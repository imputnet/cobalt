import { genericUserAgent } from "../config.js";
import { cookie as tiktokCookie } from "../processing/services/tiktok.js";

const defaultHeaders = {
    'user-agent': genericUserAgent
}

const serviceHeaders = {
    bilibili: {
        referer: 'https://www.bilibili.com/'
    },
    youtube: {
        accept: '*/*',
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com',
        DNT: '?1'
    },
    tiktok: {
        cookie: tiktokCookie
    }
}

export function getHeaders(service) {
    // Converting all header values to strings
    return Object.entries({ ...defaultHeaders, ...serviceHeaders[service] })
        .reduce((p, c) => ({ ...p, [c[0]]: String(c[1]) }), {})
}