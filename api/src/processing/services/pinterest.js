import { genericUserAgent } from "../../config.js";
import { resolveRedirectingURL } from "../url.js";
import { randomBytes } from 'node:crypto';

const videoRegex = /"url":"(https:\/\/v1\.pinimg\.com\/videos\/.*?)"/g;
const imageRegex = /src="(https:\/\/i\.pinimg\.com\/.*\.(jpg|gif))"/g;
const notFoundRegex = /"__typename"\s*:\s*"PinNotFound"/;

export async function fetchFromGraphQL(id) {
    const csrf = randomBytes(16).toString("hex");

    const responseData = await fetch("https://www.pinterest.com/_/graphql/", {
        body: JSON.stringify({
            "queryHash": "a5ebb2b085f4c3f33f14ebb7da5ca572bcde8549c478fdccfbaddbbac4f01b92",
            "variables": {
                "pinId": id,
                "isAuth": false,
                "isDesktop": true,
                "shouldPrefetchStoryPinFragment": false,
                "shouldSkipImageViewerOnPageQuery": false,
                "isUnauth": true
            }
        }),
        headers: {
            "Content-Type": "application/json",
            "Cookie": `csrftoken=${csrf}`,
            "User-Agent": genericUserAgent,
            "X-Csrftoken": csrf,
        },
        method: "POST",
    }).then(r => r.json());

    const pinResponse = responseData?.data?.v3GetPinQueryv2;
    if (!pinResponse || pinResponse.__typename !== "PinResponse") {
        return;
    }


    const pinData = pinResponse?.data;
    let bestQuality = pinData["images_orig"];
    if (!bestQuality) {
        for (const key of Object.keys(pinData)) {
            if (!key.startsWith("images_")) continue;
            const image = pinData[key];
            const size = Math.max(image.height, image.width);
            image.size = size;

            if (!bestQuality || size > bestQuality?.size) {
                bestQuality = image;
            }
        }
    }
    
    const imageType = bestQuality.url?.endsWith(".gif") ? "gif" : "jpg";
    
    if (bestQuality) {
        return {
            urls: bestQuality.url,
            isPhoto: true,
            filename: `pinterest_${id}.${imageType}`
        }
    }
}

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

    const imageType = imageLink?.endsWith(".gif") ? "gif" : "jpg"

    if (imageLink) return {
        urls: imageLink,
        isPhoto: true,
        filename: `pinterest_${id}.${imageType}`
    }

    const graphResponse = await fetchFromGraphQL(id);
    if (graphResponse) return graphResponse;

    return { error: "fetch.empty" };
}
