import { genericUserAgent } from "../config.js";

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
    }
}

export function closeRequest(controller) {
    try { controller.abort() } catch {}
}

export function closeResponse(res) {
    if (!res.headersSent) {
        res.sendStatus(500);
    }

    return res.end();
}

export function getHeaders(service) {
    // Converting all header values to strings
    return Object.entries({ ...defaultHeaders, ...serviceHeaders[service] })
        .reduce((p, [key, val]) => ({ ...p, [key]: String(val) }), {})
}

export function pipe(from, to, done) {
    from.on('error', done)
        .on('close', done);

    to.on('error', done)
      .on('close', done);

    from.pipe(to);
}
