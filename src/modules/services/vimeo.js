import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent, quality } from "../config.js";

export default async function(obj) {
    try {
        let api = await got.get(`https://player.vimeo.com/video/${obj.id}/config`, { headers: { "user-agent": genericUserAgent } });
        api.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCouldntFetch', 'vimeo') };
        });
        api = api.body
        if (api.includes('}}},"progressive":[{')) {
            api = JSON.parse(api)
            if (api["request"]["files"]["progressive"]) {
                let all = api["request"]["files"]["progressive"].sort((a, b) => Number(b.width) - Number(a.width));
                let best = all[0]
                try {
                    if (obj.quality != "max") {
                        let pref = parseInt(quality[obj.quality])
                        for (let i in all) {
                            let currQuality = parseInt(all[i]["quality"].replace('p', ''))
                            if (currQuality < pref) {
                                break;
                            } else if (currQuality == pref) {
                                best = all[i]
                            }
                        }
                    }
                } catch (e) {
                    best = all[0]
                }
                return { urls: best["url"], audioFilename: loc(obj.lang, 'ErrorEmptyDownload') }
            } else return { error: loc(obj.lang, 'ErrorEmptyDownload') }
        } else return { error: loc(obj.lang, 'ErrorBrokenLink', 'vimeo') }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
