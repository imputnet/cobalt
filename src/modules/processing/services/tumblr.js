import { genericUserAgent } from "../../config.js";

export default async function(obj) {
    let html = await fetch(`https://${
        obj.user ? obj.user : obj.url.split('.')[0].replace('https://', '')
    }.tumblr.com/post/${obj.id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });

    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!html.includes('property="og:video" content="https://va.media.tumblr.com/')) return { error: 'ErrorEmptyDownload' };

    return { urls: `https://va.media.tumblr.com/${html.split('property="og:video" content="https://va.media.tumblr.com/')[1].split('"')[0]}`, filename: `tumblr_${obj.id}.mp4`, audioFilename: `tumblr_${obj.id}_audio` }
}
