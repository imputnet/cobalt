import { resolveRedirectingURL } from "../url.js";
import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="([^"]+)" as="video"\/>/;
const NEXT_FLIGHT_REGEX = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
const NEXT_DATA_REGEX = /<script id="__NEXT_DATA__" type="application\/json">({.+})<\/script><\/body><\/html>$/;

// spotlight pages are now rendered with the next.js app router, so the video
// url is only present in the serialized flight data, not in a preload tag.
function getSpotlightFromFlightData(html, id) {
    let flight = "";
    for (const [, chunk] of html.matchAll(NEXT_FLIGHT_REGEX)) {
        try {
            flight += JSON.parse(chunk);
        } catch {}
    }

    const marker = `"rawSnapId":${JSON.stringify(id)}`;
    const start = flight.indexOf(marker);
    if (start === -1) return;

    // only look inside this video's own object: stop at the next video
    // object, so a missing videoUrl can never pick up a neighbour's
    const bodyStart = start + marker.length;
    const nextVideo = flight.indexOf('"rawSnapId":', bodyStart);
    const body = flight.slice(
        bodyStart,
        nextVideo === -1 ? bodyStart + 4096 : Math.min(nextVideo, bodyStart + 4096)
    );

    const rawURL = body.match(/"videoUrl":("(?:[^"\\]|\\.)*")/)?.[1];
    if (!rawURL) return;

    try {
        return JSON.parse(rawURL);
    } catch {}
}

function isCdnURL(url) {
    try {
        return new URL(url).hostname.endsWith(".sc-cdn.net");
    } catch {
        return false;
    }
}

async function getSpotlight(id) {
    const html = await fetch(`https://www.snapchat.com/spotlight/${id}`, {
        headers: { 'user-agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);

    if (!html) {
        return { error: "fetch.fail" };
    }

    const videoURL = html.match(SPOTLIGHT_VIDEO_REGEX)?.[1]
                  || getSpotlightFromFlightData(html, id);

    if (videoURL && isCdnURL(videoURL)) {
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
        const storyIdParam = data?.query?.profileParams?.[1];

        if (storyIdParam && data?.props?.pageProps?.story) {
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

        const defaultStory = data?.props?.pageProps?.curatedHighlights?.[0];
        if (defaultStory) {
            return {
                picker: defaultStory.snapList.map(snap => {
                    const snapType = snap.snapMediaType === 0 ? "photo" : "video";
                    const snapExt = snapType === "video" ? "mp4" : "jpg";
                    let snapUrl = snap.snapUrls.mediaUrl;

                    const proxy = createStream({
                        service: "snapchat",
                        type: "proxy",
                        url: snapUrl,
                        filename: `snapchat_${username}_${snap.timestampInSec.value}.${snapExt}`,
                    });

                    let thumbProxy;
                    if (snapType === "video") thumbProxy = createStream({
                        service: "snapchat",
                        type: "proxy",
                        url: snap.snapUrls.mediaPreviewUrl.value,
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
        params = await resolveRedirectingURL(`https://t.snapchat.com/${obj.shortLink}`);
    }

    if (params?.spotlightId) {
        const result = await getSpotlight(params.spotlightId);
        if (result) return result;
    } else if (params?.username) {
        const result = await getStory(params.username, params.storyId, obj.alwaysProxy);
        if (result) return result;
    }

    return { error: "fetch.fail" };
}
