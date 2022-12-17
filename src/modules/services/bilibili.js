import { genericUserAgent, maxVideoDuration } from "../config.js";

export default async function(obj) {
    try {
        let html = await fetch(`https://bilibili.com/video/${obj.id}`, {
            headers: {"user-agent": genericUserAgent}
        }).then(async (r) => {return r.text()}).catch(() => {return false});
        if (!html) return { error: 'ErrorCouldntFetch' };

        if (html.includes('<script>window.__playinfo__=') && html.includes('"video_codecid"')) {
            let streamData = JSON.parse(html.split('<script>window.__playinfo__=')[1].split('</script>')[0]);
            if (streamData.data.timelength <= maxVideoDuration) {
                let video = streamData["data"]["dash"]["video"].filter((v) => {
                    if (!v["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/")) return true;
                }).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));
                let audio = streamData["data"]["dash"]["audio"].filter((a) => {
                    if (!a["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/")) return true;
                }).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));
                return { urls: [video[0]["baseUrl"], audio[0]["baseUrl"]], time: streamData.data.timelength, audioFilename: `bilibili_${obj.id}_audio`, filename: `bilibili_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.mp4` };
            } else {
                return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
            }
        } else {
            return { error: 'ErrorEmptyDownload' };
        }
    } catch (e) {
        return { error: 'ErrorBadFetch' };
    }
}
