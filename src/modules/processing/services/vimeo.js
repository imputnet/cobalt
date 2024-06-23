import { env } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

import HLS from "hls-parser";

const resolutionMatch = {
    "3840": "2160",
    "2732": "1440",
    "2560": "1440",
    "2048": "1080",
    "1920": "1080",
    "1366": "720",
    "1280": "720",
    "960": "480",
    "640": "360",
    "426": "240"
}

const qualityMatch = {
    "2160": "4K",
    "1440": "2K",
    "480": "540",

    "4K": "2160",
    "2K": "1440",
    "540": "480"
}

export default async function(obj) {
    let quality = obj.quality === "max" ? "9000" : obj.quality;
    if (!quality || obj.isAudioOnly) quality = "9000";

    const url = new URL(`https://player.vimeo.com/video/${obj.id}/config`);
    if (obj.password) {
        url.searchParams.set('h', obj.password);
    }

    const api = await fetch(url)
                    .then(r => r.json())
                    .catch(() => {});
    if (!api) return { error: 'ErrorCouldntFetch' };

    let downloadType = "dash";

    if (!obj.isAudioOnly && JSON.stringify(api).includes('"progressive":[{'))
        downloadType = "progressive";

    const fileMetadata = {
        title: cleanString(api.video.title.trim()),
        artist: cleanString(api.video.owner.name.trim()),
    }

    if (downloadType !== "dash") {
        if (qualityMatch[quality]) quality = qualityMatch[quality];

        const all = api.request.files.progressive.sort((a, b) => Number(b.width) - Number(a.width));
        let best = all[0];

        let bestQuality = all[0].quality.split('p')[0];
        if (qualityMatch[bestQuality]) {
            bestQuality = qualityMatch[bestQuality]
        }

        if (Number(quality) < Number(bestQuality)) {
            best = all.find(v => v.quality.split('p')[0] === quality);
        }

        if (!best) return { error: 'ErrorEmptyDownload' };

        return {
            urls: best.url,
            audioFilename: `vimeo_${obj.id}_audio`,
            filename: `vimeo_${obj.id}_${best.width}x${best.height}.mp4`
        }
    }

    if (api.video.duration > env.durationLimit)
        return { error: ['ErrorLengthLimit', env.durationLimit / 60] };

    const urlMasterHLS = api.request.files.hls.cdns.akfire_interconnect_quic.url;

    const masterHLS = await fetch(urlMasterHLS)
                            .then(r => r.text())
                            .catch(() => {});

    if (!masterHLS) return { error: 'ErrorCouldntFetch' };

    const variants = HLS.parse(masterHLS).variants.sort(
        (a, b) => Number(b.bandwidth) - Number(a.bandwidth)
    );
    if (!variants) return { error: 'ErrorEmptyDownload' };

    let bestQuality;
    if (Number(quality) < Number(resolutionMatch[variants[0].resolution.width])) {
        bestQuality = variants.find(v =>
            (Number(quality) === Number(resolutionMatch[v.resolution.width]))
        );
    }
    if (!bestQuality) bestQuality = variants[0];

    const expandLink = (url) => {
        return new URL(url, urlMasterHLS).toString();
    };

    let urls = expandLink(bestQuality.uri);

    const audioPath = bestQuality?.audio[0]?.uri;
    if (audioPath) {
        urls = [
            urls,
            expandLink(audioPath)
        ]
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
