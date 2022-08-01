import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration } from "../config.js";

export default async function(obj) {
    try {
        let html = await got.get(`https://bilibili.com/video/${obj.id}`, {
            headers: { "user-agent": genericUserAgent }
        });
        html.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'bilibili') };
        });
        html = html.body;
        if (html.includes('<script>window.__playinfo__=') && html.includes('"video_codecid"')) {
            let streamData = JSON.parse(html.split('<script>window.__playinfo__=')[1].split('</script>')[0]);
            if (streamData.data.timelength <= maxVideoDuration) {
                let video = streamData["data"]["dash"]["video"].filter((v) => {
                    if (!v["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/") && v["height"] != 4320) return true;
                }).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));
                let audio = streamData["data"]["dash"]["audio"].filter((a) => {
                    if (!a["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/")) return true;
                }).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));
                return { urls: [video[0]["baseUrl"], audio[0]["baseUrl"]], time: streamData.data.timelength, filename: `bilibili_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.mp4` };
            } else {
                return { error: loc(obj.lang, 'ErrorLengthLimit', maxVideoDuration / 60000) };
            }
        } else {
            return { error: loc(obj.lang, 'ErrorEmptyDownload') };
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
