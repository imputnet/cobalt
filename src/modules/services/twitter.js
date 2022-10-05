import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";

export default async function(obj) {
    try {
        let req_status = await got.get(`https://cdn.syndication.twimg.com/tweet?id=${obj.id}&tweet_mode=extended`, {
            headers: { "User-Agent": genericUserAgent }
        });
        req_status.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
        })
        let parsbod = JSON.parse(req_status.body);
        if (parsbod["video"] && parsbod["video"]["variants"]) {
            let media = parsbod["video"]["variants"];
            return { urls: media.filter((v) => { if (v["type"] == "video/mp4") return true; }).sort((a, b) => Number(b["src"].split("vid/")[1].split("x")[0]) - Number(a["src"].split("vid/")[1].split("x")[0]))[0]["src"].split('?')[0], audioFilename: `twitter_${obj.id}_audio` }
        } else {
            return { error: loc(obj.lang, 'ErrorNoVideosInTweet') }
        }
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
