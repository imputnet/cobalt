import { genericUserAgent } from "../../config.js";
import { cleanString } from "../../sub/utils.js";

async function video(obj) {
    let req = await fetch(`https://www.newgrounds.com/portal/video/${obj.id}`, {
        headers: {
            'User-Agent': genericUserAgent,
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(request => request.text())
    .catch(() => {});

    if (!req) return { error: 'ErrorCouldntFetch' };

    let json;
    try {
        json = JSON.parse(req);
    } catch { return { error: 'ErrorEmptyDownload' }; }
    const highestQuality = Object.keys(json.sources)[0];
    const videoSrc = json.sources[highestQuality][0].src;
    if (!json.sources[highestQuality][0].type.includes('mp4')) {
        return { error: 'ErrorCouldntFetch' };
    }

    let fileMetadata = {
        title: cleanString(decodeURIComponent(json.title)),
        artist: cleanString(decodeURIComponent(json.author)),
    }

    return {
        urls: videoSrc,
        filenameAttributes: {
            service: "newgrounds",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            extension: 'mp4'
        },
        fileMetadata,
    }
}

async function music(obj) {
    let req = await fetch(`https://www.newgrounds.com/audio/listen/${obj.id}`, {
        headers: {
            'User-Agent': genericUserAgent,
        }
    })
    .then(request => request.text())
    .catch(() => {});

    if (!req) return { error: 'ErrorCouldntFetch' };

    const titleMatch = req.match(/"name"\s*:\s*"([^"]+)"/);
    const artistMatch = req.match(/"artist"\s*:\s*"([^"]+)"/);
    const urlMatch = req.match(/"filename"\s*:\s*"([^"]+)"/);

    if (!titleMatch || !artistMatch || !urlMatch) {
        return { error: 'ErrorCouldntFetch' };
    }

    const title = titleMatch[1];
    const artist = artistMatch[1];
    const url = urlMatch[1].replace(/\\\//g, '/');
    let fileMetadata = {
        title: cleanString(decodeURIComponent(title.trim())),
        artist: cleanString(decodeURIComponent(artist.trim())),
    }

    return {
        urls: url,
        filenameAttributes: {
            service: "newgrounds",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
        },
        fileMetadata,
        isAudioOnly: true
    }
}

export default function(obj) {
    // handle video downloads
    if (obj.type == 'portal') {
        return video(obj);
    }

    // handle audio downloads
    if (obj.type == 'audio') {
        return music(obj);
    }
    return { error: 'ErrorUnsupported' };
}