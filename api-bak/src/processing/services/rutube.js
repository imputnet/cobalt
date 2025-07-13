import HLS from "hls-parser";
import { env } from "../../config.js";

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
        if (!yappyURL) return { error: "fetch.empty" };

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
    if (!play) return { error: "fetch.fail" };

    if (play.detail?.type === "blocking_rule") {
        return { error: "content.video.region" };
    }

    if (play.detail || !play.video_balancer) return { error: "fetch.empty" };
    if (play.live_streams?.hls) return { error: "content.video.live" };

    if (play.duration > env.durationLimit * 1000)
        return { error: "content.too_long" };

    let m3u8 = await fetch(play.video_balancer.m3u8)
                     .then(r => r.text())
                     .catch(() => {});

    if (!m3u8) return { error: "fetch.fail" };

    m3u8 = HLS.parse(m3u8).variants;

    const matchingQuality = m3u8.reduce((prev, next) => {
        const diff = {
            prev: delta(quality, prev.resolution.height),
            next: delta(quality, next.resolution.height)
        };

        return diff.prev < diff.next ? prev : next;
    });

    const fileMetadata = {
        title: play.title.trim(),
        artist: play.author.name.trim(),
    }

    let subtitles;
    if (obj.subtitleLang && play.captions?.length) {
        const subtitle = play.captions.find(
            s => ["webvtt", "srt"].includes(s.format) && s.code.startsWith(obj.subtitleLang)
        );

        if (subtitle) {
            subtitles = subtitle.file;
            fileMetadata.sublanguage = obj.subtitleLang;
        }
    }

    return {
        urls: matchingQuality.uri,
        subtitles,
        isHLS: true,
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
