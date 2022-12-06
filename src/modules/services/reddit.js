import { maxVideoDuration } from "../config.js";

export default async function(obj) {
    try {
        let data = await fetch(`https://www.reddit.com/r/${obj.sub}/comments/${obj.id}/${obj.name}.json`).then(async (r) => {return await r.json()}).catch(() => {return false});
        if (!data) return { error: 'ErrorCouldntFetch' };
        data = data[0]["data"]["children"][0]["data"];

        if ("reddit_video" in data["secure_media"] && data["secure_media"]["reddit_video"]["duration"] * 1000 < maxVideoDuration) {
            let video = data["secure_media"]["reddit_video"]["fallback_url"].split('?')[0],
                audio = video.match('.mp4') ? `${video.split('_')[0]}_audio.mp4` : `${data["secure_media"]["reddit_video"]["fallback_url"].split('DASH')[0]}audio`;
            
            await fetch(audio, {method: "HEAD"}).then((r) => {if (r.status != 200) audio = ''}).catch(() => {audio = ''});
            
            let id = data["secure_media"]["reddit_video"]["fallback_url"].split('/')[3]
            if (audio.length > 0) {
                return { typeId: 2, type: "render", urls: [video, audio], audioFilename: `reddit_${id}_audio`, filename: `reddit_${id}.mp4` };
            } else {
                return { typeId: 1, urls: video };
            }
        } else {
            return { error: 'ErrorEmptyDownload' };
        }
    } catch (err) {
        return { error: 'ErrorBadFetch' };
    }
}
