import { genericUserAgent } from "../../config.js";
import { cleanString } from "../../misc/utils.js";

const qualities = ["4k", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"];

const qualityMatch = {
    2160: "4k",
    1440: "1440p",
    1080: "1080p",
    720: "720p",
    480: "480p",
    360: "360p",
    240: "240p",
    144: "144p"
}

function getQuality(sources, requestedQuality) {
    if (requestedQuality == "max") {
        for (let quality of qualities) {
            if (sources[quality]) {
                return {
                    src: sources[quality][0].src,
                    quality: quality,
                    type: sources[quality][0].type,
                }
            }
        }
    }

    let videoData = sources[qualityMatch[requestedQuality]];
    if (videoData) {
        return {
            src: videoData[0].src,
            quality: requestedQuality + "p",
            type: videoData[0].type,
        }
    }

    const qualityIndex = qualities.indexOf(qualityMatch[requestedQuality]);
    if (qualityIndex !== -1) {
        for (let i = qualityIndex; i >= 0; i--) {
            if (sources[qualities[i]]) {
                return {
                    src: sources[qualities[i]][0].src,
                    quality: qualities[i],
                    type: sources[qualities[i]][0].type,
                }
            }
        }
        for (let i = qualityIndex + 1; i < qualities.length; i++) {
            if (sources[qualities[i]]) {
                return {
                    src: sources[qualities[i]][0].src,
                    quality: qualities[i],
                    type: sources[qualities[i]][0].type,
                }
            }
        }
    }

    return null;
}

async function getVideo(obj) {
    let req = await fetch(`https://www.newgrounds.com/portal/video/${obj.id}`, {
        headers: {
            'User-Agent': genericUserAgent,
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(request => request.text())
    .catch(() => {});

    if (!req) return { error: 'fetch.fail' };

    let json;
    try {
        json = JSON.parse(req);
    } catch { return { error: 'fetch.empty' }; }

    const videoData = getQuality(json.sources, obj.quality);
    if (videoData == null) {
        return { error: 'fetch.empty' };
    }
    if (!videoData.type.includes('mp4')) {
        return { error: 'fetch.empty' };
    }

    let fileMetadata = {
        title: cleanString(decodeURIComponent(json.title)),
        artist: cleanString(decodeURIComponent(json.author)),
    }

    return {
        urls: videoData.src,
        filenameAttributes: {
            service: "newgrounds",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            extension: 'mp4',
            qualityLabel: videoData.quality,
            resolution: videoData.quality
        },
        fileMetadata,
    }
}

async function getMusic(obj) {
    let req = await fetch(`https://www.newgrounds.com/audio/listen/${obj.id}`, {
        headers: {
            'User-Agent': genericUserAgent,
        }
    })
    .then(request => request.text())
    .catch(() => {});

    if (!req) return { error: 'fetch.fail' };

    const titleMatch = req.match(/"name"\s*:\s*"([^"]+)"/);
    const artistMatch = req.match(/"artist"\s*:\s*"([^"]+)"/);
    const urlMatch = req.match(/"filename"\s*:\s*"([^"]+)"/);

    if (!titleMatch || !artistMatch || !urlMatch) {
        return { error: 'fetch.empty' };
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
    if (obj.type == 'portal') {
        return getVideo(obj);
    }
    if (obj.type == 'audio') {
        return getMusic(obj);
    }
    return { error: 'link.unsupported' };
}