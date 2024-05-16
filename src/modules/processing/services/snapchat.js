import { genericUserAgent } from "../../config.js";
import { getRedirectingURL } from "../../sub/utils.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="(https:\/\/cf-st\.sc-cdn\.net\/d\/[\w.?=]+&amp;uc=\d+)" as="video"\/>/;
const NEXT_DATA_REGEX = /<script id="__NEXT_DATA__" type="application\/json">({.+})<\/script><\/body><\/html>$/;

async function getSpotlight(pathname) {
    const html = await fetch(`https://www.snapchat.com${pathname}`, {
        headers: { 'User-Agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);
    if (!html) return { error: 'ErrorCouldntFetch' };

    const id = pathname.split('/')[2];
    const videoURL = html.match(SPOTLIGHT_VIDEO_REGEX)?.[1];
    if (videoURL) return {
        urls: videoURL,
        filename: `snapchat_${id}.mp4`,
        audioFilename: `snapchat_${id}_audio`
    }
}

async function getStory(pathname) {
    const html = await fetch(`https://www.snapchat.com${pathname}`, {
        headers: { 'User-Agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);
    if (!html) return { error: 'ErrorCouldntFetch' };

    const nextDataString = html.match(NEXT_DATA_REGEX)?.[1];
    if (nextDataString) {
        const data = JSON.parse(nextDataString);
        const storyId = data.query.profileParams[1];

        if (storyId && data.props.pageProps.story) {
            const story = data.props.pageProps.story.snapList.find((snap) => snap.snapId.value === storyId);
            if (story) {
                if (story.snapMediaType === 0)
                    return {
                        urls: story.snapUrls.mediaUrl,
                        isPhoto: true
                    }

                return {
                    urls: story.snapUrls.mediaUrl,
                    filename: `snapchat_${storyId}.mp4`,
                    audioFilename: `snapchat_${storyId}_audio`
                }
            }
        }

        const defaultStory = data.props.pageProps.curatedHighlights[0];
        if (defaultStory)
            return {
                picker: defaultStory.snapList.map((snap) => ({
                    type: snap.snapMediaType === 0 ? 'photo' : 'video',
                    url: snap.snapUrls.mediaUrl,
                    thumb: snap.snapUrls.mediaPreviewUrl.value
                }))
            }
    }
}

export default async function(obj) {
    let pathname;
    if (obj.url.hostname === 't.snapchat.com' && obj.shortLink) {
        const link = await getRedirectingURL(`https://t.snapchat.com/${obj.shortLink}`);
        if (!link || !link.startsWith('https://www.snapchat.com/')) return { error: 'ErrorCouldntFetch' };
        pathname = new URL(link).pathname;
    }

    if (!pathname) {
        if (obj.username && obj.storyId) {
            pathname = `/add/${obj.username}/${obj.storyId}`;
        } else if (obj.username) {
            pathname = `/add/${obj.username}`;
        } else if (obj.spotlightId) {
            pathname = `/spotlight/${obj.spotlightId}`;
        }
    }

    if (pathname.startsWith('/spotlight/')) {
        const result = await getSpotlight(pathname);
        if (result) return result;
    } else if (pathname.startsWith('/add/')) {
        const result = await getStory(pathname);
        if (result) return result;
    }

    return { error: 'ErrorCouldntFetch' };
}
