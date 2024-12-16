import { genericUserAgent } from "../config.js";
import { vkClientAgent } from "../processing/services/vk.js";
import { getInternalTunnelFromURL } from "./manage.js";
import { probeInternalTunnel } from "./internal.js";

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
    vk: {
        'user-agent': vkClientAgent
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

export async function estimateTunnelLength(streamInfo, multiplier = 1) {
    let urls = streamInfo.urls;
    if (!Array.isArray(urls)) {
        urls = [ urls ];
    }

    const internalTunnels = urls.map(getInternalTunnelFromURL);
    if (internalTunnels.some(t => !t))
        return -1;

    const sizes = await Promise.all(internalTunnels.map(probeInternalTunnel));
    const estimatedSize = sizes.reduce(
        // if one of the sizes is missing, let's just make a very
        // bold guess that it's the same size as the existing one
        (acc, cur) => cur <= 0 ? acc * 2 : acc + cur,
        0
    );

    if (isNaN(estimatedSize) || estimatedSize <= 0) {
        return -1;
    }

    return Math.floor(estimatedSize * multiplier);
}

export function estimateAudioMultiplier(streamInfo) {
    if (streamInfo.audioFormat === 'wav') {
        return 1411 / 128;
    }

    if (streamInfo.audioCopy) {
        return 1;
    }

    return streamInfo.audioBitrate / 128;
}
