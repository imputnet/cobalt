import { genericUserAgent } from "../../config.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="(https:\/\/cf-st\.sc-cdn\.net\/d\/[\w.?=]+&amp;uc=\d+)" as="video"\/>/;
const NEXT_DATA_REGEX = /<script id="__NEXT_DATA__" type="application\/json">({.+})<\/script><\/body><\/html>$/;

export default async function(obj) {
    let link;
    if (obj.url.hostname === 't.snapchat.com' && obj.shortLink) {
        link = await fetch(`https://t.snapchat.com/${obj.shortLink}`, { redirect: "manual" }).then((r) => {
            if (r.status === 303 && r.headers.get("location").startsWith("https://www.snapchat.com/")) {
                return r.headers.get("location").split('?', 1)[0]
            }
        }).catch(() => {});
    }

    if (!link && obj.username && obj.storyId) {
        link = `https://www.snapchat.com/add/${obj.username}/${obj.storyId}`
    } if (!link && obj.username) {
        link = `https://www.snapchat.com/add/${obj.username}`
    } else if (!link && obj.spotlightId) {
        link = `https://www.snapchat.com/spotlight/${obj.spotlightId}`
    }

    const path = new URL(link).pathname;

    if (path.startsWith('/spotlight/')) {
        const html = await fetch(link, {
            headers: { "user-agent": genericUserAgent }
        }).then((r) => { return r.text() }).catch(() => { return false });
        if (!html) return { error: 'ErrorCouldntFetch' };

        const id = path.split('/')[2];
        const videoURL = html.match(SPOTLIGHT_VIDEO_REGEX)?.[1];
        if (videoURL) return {
            urls: videoURL,
            filename: `snapchat_${id}.mp4`,
            audioFilename: `snapchat_${id}_audio`
        }
    } else if (path.startsWith('/add/')) {
        const html = await fetch(link, {
            headers: { "user-agent": genericUserAgent }
        }).then((r) => { return r.text() }).catch(() => { return false });
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
                        type: snap.snapMediaType === 0 ? "photo" : "video",
                        url: snap.snapUrls.mediaUrl,
                        thumb: snap.snapUrls.mediaPreviewUrl.value
                    }))
                }
        }
    }


    return { error: 'ErrorCouldntFetch' };
}
