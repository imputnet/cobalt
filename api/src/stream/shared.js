import { genericUserAgent } from "../config.js";
import { vkClientAgent } from "../processing/services/vk.js";
import { getCookie } from "../processing/cookie/manager.js";
import { getInternalTunnelFromURL } from "./manage.js";
import { probeInternalTunnel } from "./internal.js";

const defaultHeaders = {
    'user-agent': genericUserAgent
}

const serviceHeaders = {
    bilibili: {
        referer: 'https://www.bilibili.com/'
    },    youtube: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'max-age=0',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        referer: 'https://www.youtube.com/',
        origin: 'https://www.youtube.com'
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
    console.log(`======> [getHeaders] Getting headers for service: ${service}`);
    
    // Converting all header values to strings
    const baseHeaders = Object.entries({ ...defaultHeaders, ...serviceHeaders[service] })
        .reduce((p, [key, val]) => ({ ...p, [key]: String(val) }), {});
    
    // For YouTube, always try to add authentication cookies
    if (service === 'youtube') {
        console.log(`======> [getHeaders] YouTube service detected, checking for authentication cookies`);
        
        // First try OAuth cookies, then regular cookies
        let cookie = getCookie('youtube_oauth');
        if (!cookie) {
            console.log(`======> [getHeaders] No OAuth cookies found, trying regular youtube cookies`);
            cookie = getCookie('youtube');
        }
        
        if (cookie) {
            const cookieStr = cookie.toString();
            baseHeaders.Cookie = cookieStr;
            console.log(`======> [getHeaders] Added authentication cookie for YouTube: ${cookieStr.substring(0, 50)}${cookieStr.length > 50 ? '...' : ''}`);
        } else {
            console.log(`======> [getHeaders] WARNING: No YouTube authentication cookies found! Requests may fail.`);
        }
    }
    
    console.log(`======> [getHeaders] Final headers for ${service}:`, Object.keys(baseHeaders));
    return baseHeaders;
}

export function pipe(from, to, done) {
    let bytesTransferred = 0;
    let startTime = Date.now();
    console.log(`[pipe] Starting pipe operation`);

    from.on('error', (error) => {
        console.log(`[pipe] Source stream error after ${bytesTransferred} bytes: ${error}`);
        done(error);
    })
    .on('close', () => {
        const duration = Date.now() - startTime;
        console.log(`[pipe] Source stream closed after ${bytesTransferred} bytes in ${duration}ms`);
        done();
    })    .on('data', (chunk) => {
        bytesTransferred += chunk.length;
        // Log every 8MB (chunk size) or first few chunks
        if (bytesTransferred % (8 * 1024 * 1024) < chunk.length || bytesTransferred < 32 * 1024) {
            console.log(`[pipe] Data transferred: ${bytesTransferred} bytes`);
        }
    });

    to.on('error', (error) => {
        console.log(`[pipe] Destination stream error after ${bytesTransferred} bytes: ${error}`);
        done(error);
    })
    .on('close', () => {
        const duration = Date.now() - startTime;
        console.log(`[pipe] Destination stream closed after ${bytesTransferred} bytes in ${duration}ms`);
        done();
    });

    from.pipe(to);
    console.log(`[pipe] Pipe established between streams`);
}

export async function estimateTunnelLength(streamInfo, multiplier = 1.1) {
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
