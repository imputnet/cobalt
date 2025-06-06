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

    const imageLink = [...html.matchAll(imageRegex)]
                    .map(([, link]) => link)
                    .find(a => a.endsWith('.jpg') || a.endsWith('.gif'));

    const imageType = imageLink.endsWith(".gif") ? "gif" : "jpg"

    if (imageLink) return {
        urls: imageLink,
        isPhoto: true,
        filename: `pinterest_${id}.${imageType}`
    }

    return { error: "fetch.empty" };
}
