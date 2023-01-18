import { xml2json } from "xml-js";
import { genericUserAgent, maxVideoDuration, services } from "../config.js";
import selectQuality from "../stream/selectQuality.js";

export default async function(obj) {
    try {
        let html;
        html = await fetch(`https://vk.com/video-${obj.userId}_${obj.videoId}`, {
            headers: {"user-agent": genericUserAgent}
        }).then((r) => {return r.text()}).catch(() => {return false});
        if (!html) return { error: 'ErrorCouldntFetch' };
        if (html.includes(`{"lang":`)) {
            let js = JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']);')[0]);
            if (js["mvData"]["is_active_live"] == '0') {
                if (js["mvData"]["duration"] <= maxVideoDuration / 1000) {
                    let mpd = JSON.parse(xml2json(js["player"]["params"][0]["manifest"], { compact: true, spaces: 4 }));

                    let repr = mpd["MPD"]["Period"]["AdaptationSet"]["Representation"];
                    if (!mpd["MPD"]["Period"]["AdaptationSet"]["Representation"]) {
                        repr = mpd["MPD"]["Period"]["AdaptationSet"][0]["Representation"];
                    }
                    let attr = repr[repr.length - 1]["_attributes"];
                    let selectedQuality;
                    let qualities = Object.keys(services.vk.quality_match);
                    for (let i in qualities) {
                        if (qualities[i] == attr["height"]) {
                            selectedQuality = `url${attr["height"]}`;
                            break;
                        }
                        if (qualities[i] == attr["width"]) {
                            selectedQuality = `url${attr["width"]}`;
                            break;
                        }
                    }
                    let maxQuality = js["player"]["params"][0][selectedQuality].split('type=')[1].slice(0, 1)
                    let userQuality = selectQuality('vk', obj.quality, Object.entries(services.vk.quality_match).reduce((r, [k, v]) => { r[v] = k; return r; })[maxQuality]);
                    let userRepr = repr[services.vk.representation_match[userQuality]]["_attributes"];
                    if (selectedQuality in js["player"]["params"][0]) {
                        return {
                            urls: js["player"]["params"][0][`url${userQuality}`],
                            filename: `vk_${obj.userId}_${obj.videoId}_${userRepr["width"]}x${userRepr['height']}.mp4`
                        };
                    } else {
                        return { error: 'ErrorEmptyDownload' };
                    }
                } else {
                    return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
                }
            } else {
                return { error: 'ErrorLiveVideo' };
            }
        } else {
            return { error: 'ErrorEmptyDownload' };
        }
    } catch (err) {
        return { error: 'ErrorBadFetch' };
    }
}
