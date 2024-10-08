import { extract, normalizeURL } from "../url.js";
import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";
import { getRedirectingURL } from "../../misc/utils.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="([^"]+)" as="video"\/>/;
const NEXT_DATA_REGEX = /<script id="__NEXT_DATA__" type="application\/json">({.+})<\/script><\/body><\/html>$/;

async function getSpotlight(id) {
    const html = await fetch(`https://www.snapchat.com/spotlight/${id}`, {
        headers: { 'user-agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);

    if (!html) {
        return { error: "fetch.fail" };
    }

    const videoURL = html.match(SPOTLIGHT_VIDEO_REGEX)?.[1];

    if (videoURL && new URL(videoURL).hostname.endsWith(".sc-cdn.net")) {
        return {
            urls: videoURL,
            filename: `snapchat_${id}.mp4`,
            audioFilename: `snapchat_${id}_audio`
        }
    }
}

async function getStory(username, storyId, alwaysProxy) {
    const html = await fetch(
        `https://www.snapchat.com/add/${username}${storyId ? `/${storyId}` : ''}`,
        { headers: { 'user-agent': genericUserAgent } }
    )
    .then((r) => r.text())
    .catch(() => null);

    if (!html) {
        return { error: "fetch.fail" };
    }

    const nextDataString = html.match(NEXT_DATA_REGEX)?.[1];
    if (nextDataString) {
        const data = JSON.parse(nextDataString);
        const storyIdParam = data.query.profileParams[1];

        if (storyIdParam && data.props.pageProps.story) {
            const story = data.props.pageProps.story.snapList.find((snap) => snap.snapId.value === storyIdParam);
            if (story) {
                if (story.snapMediaType === 0) {
                    return {
                        urls: story.snapUrls.mediaUrl,
                        filename: `snapchat_${storyId}.jpg`,
                        isPhoto: true
                    }
                }

                return {
                    urls: story.snapUrls.mediaUrl,
                    filename: `snapchat_${storyId}.mp4`,
                    audioFilename: `snapchat_${storyId}_audio`
                }
            }
        }

        const defaultStory = data.props.pageProps.curatedHighlights[0];
        if (defaultStory) {
            return {
                picker: defaultStory.snapList.map(snap => {
                    const snapType = snap.snapMediaType === 0 ? "photo" : "video";
                    const snapExt = snapType === "video" ? "mp4" : "jpg";
                    let snapUrl = snap.snapUrls.mediaUrl;

                    const proxy = createStream({
                        service: "snapchat",
                        type: "proxy",
                        u: snapUrl,
                        filename: `snapchat_${username}_${snap.timestampInSec.value}.${snapExt}`,
                    });

                    let thumbProxy;
                    if (snapType === "video") thumbProxy = createStream({
                        service: "snapchat",
                        type: "proxy",
                        u: snap.snapUrls.mediaPreviewUrl.value,
                    });

                    if (alwaysProxy) snapUrl = proxy;

                    return {
                        type: snapType,
                        url: snapUrl,
                        thumb: thumbProxy || proxy,
                    }
                })
            }
        }
    }
}

export default async function (obj) {
    let params = obj;
    if (obj.shortLink) {
        const link = await getRedirectingURL(`https://t.snapchat.com/${obj.shortLink}`);

        if (!link?.startsWith('https://www.snapchat.com/')) {
            return { error: "fetch.short_link" };
        }

        const extractResult = extract(normalizeURL(link));
        if (extractResult?.host !== 'snapchat') {
            return { error: "fetch.short_link" };
        }

        params = extractResult.patternMatch;
    }

    if (params.spotlightId) {
        const result = await getSpotlight(params.spotlightId);
        if (result) return result;
    } else if (params.username) {
        const result = await getStory(params.username, params.storyId, obj.alwaysProxy);
        if (result) return result;
    }

    return { error: "fetch.fail" };
}
