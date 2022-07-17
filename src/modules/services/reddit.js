import got from "got";
import loc from "../sub/i18n.js";
import { genericUserAgent, maxVideoDuration } from "../config.js";

export default async function(obj) {
    try {
        let req = await got.get(`https://www.reddit.com/r/${obj.sub}/comments/${obj.id}/${obj.name}.json`, { headers: { "user-agent": genericUserAgent } });
        let data = (JSON.parse(req.body))[0]["data"]["children"][0]["data"];
        if ("reddit_video" in data["secure_media"] && data["secure_media"]["reddit_video"]["duration"] * 1000 < maxVideoDuration) {
            return { urls: [data["secure_media"]["reddit_video"]["fallback_url"].split('?')[0], `${data["secure_media"]["reddit_video"]["fallback_url"].split('_')[0]}_audio.mp4`], filename: `reddit_${data["secure_media"]["reddit_video"]["fallback_url"].split('/')[3]}.mp4` };
        } else {
            return { error: loc(obj.lang, 'apiError', 'nothingToDownload') };
        }
    } catch (err) {
        return { error: loc(obj.lang, 'apiError', 'noFetch') };
    }
}