import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";

function bestQuality(arr) {
    return arr.filter((v) => { if (v["content_type"] == "video/mp4") return true; }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split("?")[0]
}
const apiURL = "https://api.twitter.com/1.1"

export default async function(obj) {
    try {
        let _headers = {
            "User-Agent": genericUserAgent,
            "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
            "Host": "api.twitter.com",
            "Content-Type": "application/json",
            "Content-Length": 0
        };
        let req_act = await got.post(`${apiURL}/guest/activate.json`, {
            headers: _headers
        });
        req_act.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
        })
        _headers["x-guest-token"] = req_act.body["guest_token"];
        let req_status = await got.get(`${apiURL}/statuses/show/${obj.id}.json?tweet_mode=extended&include_user_entities=0&trim_user=1&include_entities=0&cards_platform=Web-12&include_cards=1`, {
            headers: _headers
        });
        req_status.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'twitter') }
        })
        let parsbod = JSON.parse(req_status.body);
        if (parsbod["extended_entities"] && parsbod["extended_entities"]["media"]) {
            let single, multiple = [], media = parsbod["extended_entities"]["media"];
            media = media.filter((i) => { if (i["type"] == "video" || i["type"] == "animated_gif") return true })
            if (media.length > 1) {
                for (let i in media) {
                    multiple.push({type: "video", thumb: media[i]["media_url_https"], url: bestQuality(media[i]["video_info"]["variants"])})
                }
            } else {
                single = bestQuality(media[0]["video_info"]["variants"])
            }
            if (single) {
                return { urls: single, audioFilename: `twitter_${obj.id}_audio` }
            } else if (multiple) {
                return { picker: multiple }
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
