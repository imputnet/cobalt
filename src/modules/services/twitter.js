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
        if (parsbod["extended_entities"] && parsbod["extended_entities"]["media"]) {
            let media = parsbod["extended_entities"]["media"][0]
            if (media["type"] === "video" || media["type"] === "animated_gif") {
                return { urls: media["video_info"]["variants"].filter((v) => { if (v["content_type"] == "video/mp4") return true; }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split('?')[0], audioFilename: `twitter_${obj.id}_audio` }
            } else {
                return { error: loc(obj.lang, 'ErrorNoVideosInTweet') }
            }
        } else {
            return { error: loc(obj.lang, 'ErrorNoVideosInTweet') }
        }
    } catch (err) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
