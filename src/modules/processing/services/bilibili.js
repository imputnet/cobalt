import { genericUserAgent, maxVideoDuration } from "../../config.js";

// TO-DO: quality picking, bilibili.tv support, and higher quality downloads (currently requires an account)
export default async function(obj) {
    let html = await fetch(`https://bilibili.com/video/${obj.id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });
    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!(html.includes('<script>window.__playinfo__=') && html.includes('"video_codecid"'))) return { error: 'ErrorEmptyDownload' };

    let streamData = JSON.parse(html.split('<script>window.__playinfo__=')[1].split('</script>')[0]);
    if (streamData.data.timelength > maxVideoDuration) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let video = streamData["data"]["dash"]["video"].filter(v => 
        !v["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/")
    ).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));

    let audio = streamData["data"]["dash"]["audio"].filter(a => 
        !a["baseUrl"].includes("https://upos-sz-mirrorcosov.bilivideo.com/")
    ).sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));

    return {
        urls: [video[0]["baseUrl"], audio[0]["baseUrl"]],
        audioFilename: `bilibili_${obj.id}_audio`,
        filename: `bilibili_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.mp4`
    };
}
