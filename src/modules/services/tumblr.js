import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";

export default async function(obj) {
    try {
        let user = obj.user ? obj.user : obj.url.split('.')[0].replace('https://', '');
        if (user.length <= 32) {
            let html = await got.get(`https://${user}.tumblr.com/post/${obj.id}`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCouldntFetch', 'tumblr') };
            });
            html = html.body
            if (html.includes('<!-- GOOGLE CAROUSEL --><script type="application/ld+json">')) {
                let json = JSON.parse(html.split('<!-- GOOGLE CAROUSEL --><script type="application/ld+json">')[1].split('</script>')[0])
                if (json["video"] && json["video"]["contentUrl"]) {
                    return json["video"]["contentUrl"]
                } else return { error: loc(obj.lang, 'ErrorEmptyDownload') }
            } else return { error: loc(obj.lang, 'ErrorBrokenLink', 'tumblr') }
        } else return { error: loc(obj.lang, 'ErrorBrokenLink', 'tumblr') }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
