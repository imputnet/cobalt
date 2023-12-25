import psl from "psl";
import { genericUserAgent } from "../../config.js";

export default async function(obj) {
    let { subdomain } = psl.parse(obj.url.hostname);

    if (subdomain?.includes('.')) {
        return { error: ['ErrorBrokenLink', 'tumblr'] }
    } else if (subdomain === 'www' || subdomain === 'at') {
        subdomain = undefined
    }

    let html = await fetch(`https://${subdomain ?? obj.user}.tumblr.com/post/${obj.id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });

    if (!html) return { error: 'ErrorCouldntFetch' };

    let r;
    if (html.includes('property="og:video" content="https://va.media.tumblr.com/')) {
        r = {
            urls: `https://va.media.tumblr.com/${html.split('property="og:video" content="https://va.media.tumblr.com/')[1].split('"')[0]}`,
            filename: `tumblr_${obj.id}.mp4`,
            audioFilename: `tumblr_${obj.id}_audio`
        }
    } else if (html.includes('property="og:audio" content="https://a.tumblr.com/')) {
        r = {
            urls: `https://a.tumblr.com/${html.split('property="og:audio" content="https://a.tumblr.com/')[1].split('"')[0]}`,
            audioFilename: `tumblr_${obj.id}`,
            isAudioOnly: true
        }
    } else r = { error: 'ErrorEmptyDownload' };

    return r
}
