import { genericUserAgent } from "../../config.js";
import { resolveRedirectingURL } from "../url.js";

const videoRegex = /"url":"(https:\/\/v1\.pinimg\.com\/videos\/.*?)"/g;
const imageRegex = /src="(https:\/\/i\.pinimg\.com\/.*\.(jpg|gif))"/g;
const notFoundRegex = /"__typename"\s*:\s*"PinNotFound"/;

export default async function(o) {
    let id = o.id;

    if (!o.id && o.shortLink) {
        const patternMatch = await resolveRedirectingURL(`https://api.pinterest.com/url_shortener/${o.shortLink}/redirect/`);
        id = patternMatch?.id;
    }

    if (id.includes("--")) id = id.split("--")[1];
    if (!id) return { error: "fetch.fail" };

    const html = await fetch(`https://www.pinterest.com/pin/${id}/`, {
        headers: { "user-agent": genericUserAgent }
    }).then(r => r.text()).catch(() => {});

    const invalidPin = html.match(notFoundRegex);

    if (invalidPin) return { error: "fetch.empty" };

    if (!html) return { error: "fetch.fail" };

    const videoLink = [...html.matchAll(videoRegex)]
                    .map(([, link]) => link)
                    .find(a => a.endsWith('.mp4'));

    if (videoLink) return {
        urls: videoLink,
        filename: `pinterest_${id}.mp4`,
        audioFilename: `pinterest_${id}_audio`
    }

    const allImageMatches = [...html.matchAll(imageRegex)];
    
    if (allImageMatches.length === 0) {
        return { error: "fetch.empty" };
    }

    // Step 1: Get the first image (always main content)
    const firstImageUrl = allImageMatches[0][1];
    
    // Step 2: Extract the image hash/identifier
    const hashMatch = firstImageUrl.match(/\/([0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32})\.(jpg|gif)/);
    
    if (!hashMatch) {
        // Fallback to first image if we can't parse the hash
        const imageType = firstImageUrl.endsWith(".gif") ? "gif" : "jpg";
        return {
            urls: firstImageUrl,
            isPhoto: true,
            filename: `pinterest_${id}.${imageType}`
        };
    }
    
    const imageHash = hashMatch[1]; // e.g., "7c/0a/1c/7c0a1c5f1c999a4a67f3c5b847da093c"
    const extension = hashMatch[2];
    
    // Step 3: Find all variations of this specific image
    const sameImageUrls = allImageMatches
        .map(([, url]) => url)
        .filter(url => url.includes(imageHash))
        .filter(url => url.endsWith(`.${extension}`));
    
    // Step 4: Sort by quality and take the best
    const bestQualityUrl = sameImageUrls.sort((a, b) => {
        const getQualityScore = (url) => {
            if (url.includes('/originals/')) return 4;
            if (url.includes('/736x/')) return 3;
            if (url.includes('/474x/')) return 2;
            if (url.includes('/236x/')) return 1;
            return 0;
        };
        return getQualityScore(b) - getQualityScore(a);
    })[0];
    
    const imageType = extension;

    if (bestQualityUrl) return {
        urls: bestQualityUrl,
        isPhoto: true,
        filename: `pinterest_${id}.${imageType}`
    }

    return { error: "fetch.empty" };
}
