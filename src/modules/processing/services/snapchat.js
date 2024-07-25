import { genericUserAgent } from "../../config.js";
import { getRedirectingURL } from "../../sub/utils.js";
import { extract, normalizeURL } from "../url.js";

const SPOTLIGHT_VIDEO_REGEX = /<link data-react-helmet="true" rel="preload" href="(https:\/\/cf-st\.sc-cdn\.net\/d\/[\w.?=]+&amp;uc=\d+)" as="video"\/>/;
const NEXT_DATA_REGEX = /<script id="__NEXT_DATA__" type="application\/json">({.+})<\/script><\/body><\/html>$/;

async function getSpotlight(id) {
    const html = await fetch(`https://www.snapchat.com/spotlight/${id}`, {
        headers: { 'User-Agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);
    if (!html) {  
        return { error: 'ErrorCouldntFetch' };  
    }

    const videoURL = html.match(SPOTLIGHT_VIDEO_REGEX)?.[1];
    if (videoURL) {
        return {
            urls: videoURL,
            filename: `snapchat_${id}.mp4`,
            audioFilename: `snapchat_${id}_audio`
        }
    }
}

async function getStory(username, storyId) {
    const html = await fetch(`https://www.snapchat.com/add/${username}${storyId ? `/${storyId}` : ''}`, {
        headers: { 'User-Agent': genericUserAgent }
    }).then((r) => r.text()).catch(() => null);
    if (!html) {  
        return { error: 'ErrorCouldntFetch' };  
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
                picker: defaultStory.snapList.map((snap) => ({
                    type: snap.snapMediaType === 0 ? 'photo' : 'video',
                    url: snap.snapUrls.mediaUrl,
                    thumb: snap.snapUrls.mediaPreviewUrl.value
                }))
            }
        }
    }
}

export default async function(obj) {
    let params = obj;
    if (obj.url.hostname === 't.snapchat.com' && obj.shortLink) {
        const link = await getRedirectingURL(`https://t.snapchat.com/${obj.shortLink}`);
    
        if (!link?.startsWith('https://www.snapchat.com/')) {  
            return { error: 'ErrorCouldntFetch' };  
        }  

        const extractResult = extract(normalizeURL(link));
        if (extractResult?.host !== 'snapchat') {  
            return { error: 'ErrorCouldntFetch' };  
        }

        params = extractResult.patternMatch;
    }

    if (params.spotlightId) {
        const result = await getSpotlight(params.spotlightId);
        if (result) return result;
    } else if (params.username) {
        const result = await getStory(params.username, params.storyId);
        if (result) return result;
    }

    return { error: 'ErrorCouldntFetch' };
}
