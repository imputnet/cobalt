import got from "got";
import loc from "../../localization/manager.js";
import { services } from "../config.js";

const configSt = services.twitter;

async function fetchTweetInfo(obj) {
    let cantConnect = { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
    try {
        let _headers = {
            "Authorization": `Bearer ${configSt.token}`,
            "Host": configSt.api,
            "Content-Type": "application/json",
            "Content-Length": 0
        };
        let req_act = await got.post(`https://${configSt.api}/${configSt.apiURLs.activate}`, {
            headers: _headers
        });
        req_act.on('error', (err) => {
            return cantConnect
        })
        _headers["x-guest-token"] = req_act.body["guest_token"];
        let req_status = await got.get(`https://${configSt.api}/${configSt.apiURLs.status_show}?id=${obj.id}&tweet_mode=extended`, {
            headers: _headers
        });
        req_status.on('error', (err) => {
            return cantConnect
        })
        return JSON.parse(req_status.body);
    } catch (err) {
        return cantConnect;
    }
}
export default async function(obj) {
    let nothing = { error: loc(obj.lang, 'ErrorEmptyDownload') }
    try {
        let parsbod = await fetchTweetInfo(obj);
        if (!parsbod.error) {
            if (parsbod.hasOwnProperty("extended_entities") && parsbod["extended_entities"].hasOwnProperty("media")) {
                if (parsbod["extended_entities"]["media"][0]["type"] === "video" || parsbod["extended_entities"]["media"][0]["type"] === "animated_gif") {
                    let variants = parsbod["extended_entities"]["media"][0]["video_info"]["variants"]
                    return { urls: variants.filter((v) => { if (v["content_type"] == "video/mp4") return true; }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split('?')[0], audioFilename: `twitter_${obj.id}_audio` }
                } else {
                    return nothing
                }
            } else {
                return nothing
            }
        } else return parsbod;
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
