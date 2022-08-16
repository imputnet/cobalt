import got from "got";
import { xml2json } from "xml-js";
import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration, services } from "../config.js";
import selectQuality from "../stream/selectQuality.js";

export default async function(obj) {
    try {
        let html = await got.get(`https://vk.com/video-${obj.userId}_${obj.videoId}`, { headers: { "user-agent": genericUserAgent } });
        html.on('error', (err) => {
            return false;
        });
        html = html.body;
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
                    let selectedQuality = `url${attr["height"]}`;

                    let maxQuality = js["player"]["params"][0][selectedQuality].split('type=')[1].slice(0, 1)
                    let userQuality = selectQuality('vk', obj.quality, Object.entries(services.vk.quality_match).reduce((r, [k, v]) => { r[v] = k; return r; })[maxQuality])
                    let id = js["player"]["params"][0][selectedQuality].split("id=")[1]
                    if (selectedQuality in js["player"]["params"][0]) {
                        return { urls: js["player"]["params"][0][selectedQuality].replace(`type=${maxQuality}`, `type=${services.vk.quality_match[userQuality]}`), filename: `vk_${id}_${attr['width']}x${attr['height']}.mp4`, audioFilename: loc(obj.lang, 'ErrorEmptyDownload') };
                    } else {
                        return { error: loc(obj.lang, 'ErrorEmptyDownload') };
                    }
                } else {
                    return { error: loc(obj.lang, 'ErrorLengthLimit', maxVideoDuration / 60000) };
                }
            } else {
                return { error: loc(obj.lang, 'ErrorLiveVideo') };
            }
        } else {
            return { error: loc(obj.lang, 'ErrorEmptyDownload') };
        }
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
