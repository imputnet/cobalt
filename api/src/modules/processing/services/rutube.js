import HLS from 'hls-parser';

import { env } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

async function requestJSON(url) {
    try {
        const r = await fetch(url);
        return await r.json();
    } catch {}
}

const delta = (a, b) => Math.abs(a - b);

export default async function(obj) {
    if (obj.yappyId) {
        const yappy = await requestJSON(
            `https://rutube.ru/pangolin/api/web/yappy/yappypage/?client=wdp&videoId=${obj.yappyId}&page=1&page_size=15`
        )
        const yappyURL = yappy?.results?.find(r => r.id === obj.yappyId)?.link;
        if (!yappyURL) return { error: 'ErrorEmptyDownload' };

        return {
            urls: yappyURL,
            filename: `rutube_yappy_${obj.yappyId}.mp4`,
            audioFilename: `rutube_yappy_${obj.yappyId}_audio`
        }
    }

    const quality = Number(obj.quality) || 9000;

    const requestURL = new URL(`https://rutube.ru/api/play/options/${obj.id}/?no_404=true&referer&pver=v2`);
    if (obj.key) requestURL.searchParams.set('p', obj.key);

    const play = await requestJSON(requestURL);
    if (!play) return { error: 'ErrorCouldntFetch' };

    if (play.detail || !play.video_balancer) return { error: 'ErrorEmptyDownload' };
    if (play.live_streams?.hls) return { error: 'ErrorLiveVideo' };

    if (play.duration > env.durationLimit * 1000)
        return { error: ['ErrorLengthLimit', env.durationLimit / 60] };

    let m3u8 = await fetch(play.video_balancer.m3u8)
                     .then(r => r.text())
                     .catch(() => {});

    if (!m3u8) return { error: 'ErrorCouldntFetch' };

    m3u8 = HLS.parse(m3u8).variants;

    const matchingQuality = m3u8.reduce((prev, next) => {
        const diff = {
            prev: delta(quality, prev.resolution.height),
            next: delta(quality, next.resolution.height)
        };

        return diff.prev < diff.next ? prev : next;
    });

    const fileMetadata = {
        title: cleanString(play.title.trim()),
        artist: cleanString(play.author.name.trim()),
    }

    return {
        urls: matchingQuality.uri,
        isM3U8: true,
        filenameAttributes: {
            service: "rutube",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            resolution: `${matchingQuality.resolution.width}x${matchingQuality.resolution.height}`,
            qualityLabel: `${matchingQuality.resolution.height}p`,
            extension: "mp4"
        },
        fileMetadata: fileMetadata
    }
}
