import { genericUserAgent } from "../../config.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="(https:\/\/cf-st\.sc-cdn\.net\/d\/[\w.?=]+&amp;uc=46)" as="video"\/>/;

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

        const id = path.split('/')[3];
        const storyVideoRegex = new RegExp(`"snapId":{"value":"${id}"},"snapMediaType":1,"snapUrls":{"mediaUrl":"(https:\\/\\/bolt-gcdn\\.sc-cdn\\.net\\/3\/[^"]+)","mediaPreviewUrl"`);
        const videoURL = html.match(storyVideoRegex)?.[1];
        if (videoURL) return {
            urls: videoURL,
            filename: `snapchat_${id}.mp4`,
            audioFilename: `snapchat_${id}_audio`
        }
    }


    return { error: 'ErrorCouldntFetch' };
}
