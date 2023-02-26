import { xml2json } from "xml-js";
import { genericUserAgent, maxVideoDuration } from "../../config.js";

const representationMatch = {
    "2160": 7,
    "1440": 6,
    "1080": 5,
    "720": 4,
    "480": 3,
    "360": 2,
    "240": 1,
    "144": 0
}
const resolutionMatch = {
    "3840": "2160",
    "2560": "1440",
    "1920": "1080",
    "1280": "720",
    "852": "480",
    "640": "360",
    "426": "240",
    // "256": "144"
}

export default async function(o) {
    let html;
    html = await fetch(`https://vk.com/video-${o.userId}_${o.videoId}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });
    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!html.includes(`{"lang":`)) return { error: 'ErrorEmptyDownload' };

    let quality = o.quality === "max" ? 7 : representationMatch[o.quality];
    let js = JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']);')[0]);

    if (Number(js.mvData.is_active_live) !== 0) return { error: 'ErrorLiveVideo' };
    if (js.mvData.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let mpd = JSON.parse(xml2json(js.player.params[0]["manifest"], { compact: true, spaces: 4 }));
    let repr = mpd.MPD.Period.AdaptationSet.Representation ? mpd.MPD.Period.AdaptationSet.Representation : mpd.MPD.Period.AdaptationSet[0]["Representation"];
    let bestQuality = repr[repr.length - 1];
    let resolutionPick = Number(bestQuality._attributes.width) > Number(bestQuality._attributes.height) ? 'width': 'height'
    if (Number(bestQuality._attributes.id) > Number(quality)) bestQuality = repr[quality];

    if (bestQuality) return {
        urls: js.player.params[0][`url${resolutionMatch[bestQuality._attributes[resolutionPick]]}`],
        filename: `vk_${o.userId}_${o.videoId}_${bestQuality._attributes.width}x${bestQuality._attributes.height}.mp4`
    };
    return { error: 'ErrorEmptyDownload' }
}
