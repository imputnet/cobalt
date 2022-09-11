import got from "got";
import { xml2json } from "xml-js";
import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration, services } from "../config.js";
import selectQuality from "../stream/selectQuality.js";

export default async function(obj) {
    try {
        let html;
        let isClip = obj.url.includes("vk.com/clip");

        if (isClip) {
            html = await got.post("https://vk.com/al_video.php?act=show", {
                headers: {
                    "user-agent": genericUserAgent,
                    "referer": `https://vk.com/clips-${obj.userId}?z=clip-${obj.userId}_${obj.videoId}`
                },
                body: `_nol={"0":"clips-${obj.userId}","z":"clip-${obj.userId}_${obj.videoId}"}&act=show&al=1&autoplay=0&list=&module=&video=-${obj.userId}_${obj.videoId}`
            });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCouldntFetch', 'vk') };
            });
            html = html.body;
        } else {
            html = await got.get(`https://vk.com/video-${obj.userId}_${obj.videoId}`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCouldntFetch', 'vk') };
            });
            html = html.body;
        }
        
        if (html.includes(`{"lang":`)) {
            let js = isClip ? JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']],"static":')[0]) : JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']);')[0]);
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
                            filename: `vk_${obj.userId}_${obj.videoId}_${userRepr["width"]}x${userRepr['height']}.mp4`,
                            audioFilename: loc(obj.lang, 'ErrorEmptyDownload')
                        };
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
