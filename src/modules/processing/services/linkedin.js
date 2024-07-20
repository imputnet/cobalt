import { genericUserAgent } from "../../config.js";

const qualityMatch = {
    "mp4-640p-30fp-crf28": 640,
    "mp4-720p-30fp-crf28": 720
};

export default async function (obj) {
    const html = await fetch(
        `https://www.linkedin.com/feed/update/urn:li:activity:${obj.postId}`,
        { headers: { "user-agent": genericUserAgent } }
    )
        .then((res) => res.text())
        .catch(() => {});

    if (!html) {
        return { error: "ErrorCouldntFetch" };
    }

    let data;
    try {
        const json = html
            .split('data-sources="')[1]
            .split('" data-poster-url="')[0]
            .replaceAll("&quot;", '"')
            .replaceAll("&amp;", "&");
        data = JSON.parse(json);
    } catch (error) {
        return { error: "ErrorCouldntFetch" };
    }

    let fallbackUrl;
    const quality = obj.quality === "max" || obj.quality >= 720 ? 720 : 640;
    const filenameBase = `linkedin_${obj.postId}`;

    for (const source of data) {
        const videoQuality = qualityMatch[source.src.split("/")[6]];

        if (videoQuality === quality) {
            return {
                urls: source.src,
                filename: `${filenameBase}.mp4`,
                audioFilename: `${filenameBase}_audio`
            };
            // will prioritize using known quality over unknown quality if no matching quality
        } else if (!videoQuality && !fallbackUrl) {
            fallbackUrl = source.src;
        } else {
            fallbackUrl = source.src;
        }
    }

    if (fallbackUrl) {
        return {
            urls: fallbackUrl,
            filename: `${filenameBase}.mp4`,
            audioFilename: `${filenameBase}_audio`
        };
    }

    return { error: "ErrorEmptyDownload" };
}
