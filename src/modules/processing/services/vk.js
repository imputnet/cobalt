import { genericUserAgent, maxVideoDuration } from "../../config.js";

const resolutions = ["2160", "1440", "1080", "720", "480", "360", "240"];

export default async function(o) {
    let html, url, 
        quality = o.quality === "max" ? 2160 : o.quality,
        filename = `vk_${o.userId}_${o.videoId}_`;

    html = await fetch(`https://vk.com/video${o.userId}_${o.videoId}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });

    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!html.includes(`{"lang":`)) return { error: 'ErrorEmptyDownload' };

    let js = JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']);')[0]);

    if (Number(js.mvData.is_active_live) !== 0) return { error: 'ErrorLiveVideo' };
    if (js.mvData.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    for (let i in resolutions) {
        if (js.player.params[0][`url${resolutions[i]}`]) {
            quality = resolutions[i];
            break
        }
    }
    if (Number(quality) > Number(o.quality)) quality = o.quality;

    url = js.player.params[0][`url${quality}`];
    filename += `${quality}p.mp4`

    if (url && filename) return {
        urls: url,
        filename: filename
    }
    return { error: 'ErrorEmptyDownload' }
}
