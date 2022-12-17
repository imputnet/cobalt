import { genericUserAgent } from "../config.js";

export default async function(obj) {
    try {
        let user = obj.user ? obj.user : obj.url.split('.')[0].replace('https://', '');
        let html = await fetch(`https://${user}.tumblr.com/post/${obj.id}`, {
            headers: {"user-agent": genericUserAgent}
        }).then(async (r) => {return r.text()}).catch(() => {return false});
        if (!html) return { error: 'ErrorCouldntFetch' };
        if (html.includes('property="og:video" content="https://va.media.tumblr.com/')) {
            return { urls: `https://va.media.tumblr.com/${html.split('property="og:video" content="https://va.media.tumblr.com/')[1].split('"/>')[0]}`, audioFilename: `tumblr_${obj.id}_audio` }
        } else return { error: 'ErrorEmptyDownload' }
    } catch (e) {
        return { error: 'ErrorBadFetch' };
    }
}
