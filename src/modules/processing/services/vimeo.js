import { env } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

import HLS from "hls-parser";

const resolutionMatch = {
    "3840": 2160,
    "2732": 1440,
    "2560": 1440,
    "2048": 1080,
    "1920": 1080,
    "1366": 720,
    "1280": 720,
    "960": 480,
    "640": 360,
    "426": 240
}

export default async function(obj) {
    let quality = obj.quality === "max" ? 9000 : Number(obj.quality);
    if (quality < 240) quality = 240;
    if (!quality || obj.isAudioOnly) quality = 9000;

    const url = new URL(`https://player.vimeo.com/video/${obj.id}/config`);
    if (obj.password) {
        url.searchParams.set('h', obj.password);
    }

    const api = await fetch(url)
                    .then(r => r.json())
                    .catch(() => {});

    if (!api) return { error: 'ErrorCouldntFetch' };

    const fileMetadata = {
        title: cleanString(api.video.title.trim()),
        artist: cleanString(api.video.owner.name.trim()),
    }

    if (api.video?.duration > env.durationLimit)
        return { error: ['ErrorLengthLimit', env.durationLimit / 60] };

    const urlMasterHLS = api.request?.files?.hls?.cdns?.akfire_interconnect_quic?.url;

    if (!urlMasterHLS) return { error: 'ErrorCouldntFetch' }

    const masterHLS = await fetch(urlMasterHLS)
                            .then(r => r.text())
                            .catch(() => {});

    if (!masterHLS) return { error: 'ErrorCouldntFetch' };

    const variants = HLS.parse(masterHLS)?.variants?.sort(
        (a, b) => Number(b.bandwidth) - Number(a.bandwidth)
    );
    if (!variants || variants.length === 0) return { error: 'ErrorEmptyDownload' };

    let bestQuality;

    if (quality < resolutionMatch[variants[0]?.resolution?.width]) {
        bestQuality = variants.find(v =>
            (quality === resolutionMatch[v.resolution.width])
        );
    }

    if (!bestQuality) bestQuality = variants[0];

    const expandLink = (path) => {
        return new URL(path, urlMasterHLS).toString();
    };

    let urls = expandLink(bestQuality.uri);

    const audioPath = bestQuality?.audio[0]?.uri;
    if (audioPath) {
        urls = [
            urls,
            expandLink(audioPath)
        ]
    } else if (obj.isAudioOnly) {
        return { error: 'ErrorEmptyDownload' };
    }

    return {
        urls,
        isM3U8: true,
        fileMetadata: fileMetadata,
        filenameAttributes: {
            service: "vimeo",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            resolution: `${bestQuality.resolution.width}x${bestQuality.resolution.height}`,
            qualityLabel: `${resolutionMatch[bestQuality.resolution.width]}p`,
            extension: "mp4"
        }
    }
}
