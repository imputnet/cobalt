import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration } from "../config.js";

export default async function(obj) {
    try {
        let req = await got.get(`https://www.reddit.com/r/${obj.sub}/comments/${obj.id}/${obj.name}.json`, { headers: { "user-agent": genericUserAgent } });
        let data = (JSON.parse(req.body))[0]["data"]["children"][0]["data"];
        if ("reddit_video" in data["secure_media"] && data["secure_media"]["reddit_video"]["duration"] * 1000 < maxVideoDuration) {
            let video = data["secure_media"]["reddit_video"]["fallback_url"].split('?')[0],
                audio = video.match('.mp4') ? `${video.split('_')[0]}_audio.mp4` : `${data["secure_media"]["reddit_video"]["fallback_url"].split('DASH')[0]}audio`;
            try {
                await got.head(audio, { headers: { "user-agent": genericUserAgent } });
            } catch (err) {
                audio = ''
            }
            if (audio.length > 0) {
                return { typeId: 2, type: "render", urls: [video, audio], filename: `reddit_${data["secure_media"]["reddit_video"]["fallback_url"].split('/')[3]}.mp4` };
            } else {
                return { typeId: 1, urls: video};
            }
        } else {
            return { error: loc(obj.lang, 'ErrorEmptyDownload') };
        }
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}