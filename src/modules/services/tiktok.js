import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";
import { unicodeDecode } from "../sub/utils.js";

let userAgent = genericUserAgent.split(' Chrome/1')[0]
let config = {
    tiktok: {
        short: "https://vt.tiktok.com/",
        api: "https://api2.musical.ly/aweme/v1/feed/?aweme_id={postId}&version_code=262&app_name=musical_ly&channel=App&device_id=null&os_version=14.4.2&device_platform=iphone&device_type=iPhone9", // ill always find more endpoints lmfao
    },
    douyin: {
        short: "https://v.douyin.com/",
        api: "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={postId}",
    }
}
function selector(j, h, id) {
    switch (h) {
        case "tiktok":
            let t = j["aweme_list"].filter((v) => {
                if (v["aweme_id"] == id) return true
            })
            if (t.length > 0) {
                return t[0]
            } else return false
        case "douyin":
            return j['item_list'][0]
    }
}

export default async function(obj) {
    try {
        if (!obj.postId) {
            let html = await got.get(`${config[obj.host]["short"]}${obj.id}`, { followRedirect: false, headers: { "user-agent": userAgent } });
            html = html.body;
            if (html.slice(0, 17) === '<a href="https://' && html.includes('/video/')) obj.postId = html.split('video/')[1].split('?')[0].replace("/", '')
        }
        if (!obj.postId) return { error: loc(obj.lang, 'ErrorCantGetID') };
        let detail;
        try {
            detail = await got.get(config[obj.host]["api"].replace("{postId}", obj.postId), { headers: {"User-Agent":"TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"} });
            detail = selector(JSON.parse(detail.body), obj.host, obj.postId);
            if (!detail) throw new Error()
        } catch (e) {
            if (obj.host === "tiktok") {
                let html = await got.get(`https://tiktok.com/@video/video/${obj.postId}`, { headers: { "user-agent": userAgent } });
                html = html.body;
                if (html.includes(',"preloadList":[{"url":"')) {
                    return {
                        urls: unicodeDecode(html.split(',"preloadList":[{"url":"')[1].split('","id":"')[0].trim()),
                        filename: `${obj.host}_${obj.postId}_video.mp4`
                    }
                } else throw new Error()
            } else throw new Error()
        }
        let video, videoFilename, audioFilename, isMp3, audio,
        images = detail["image_post_info"] ? detail["image_post_info"]["images"] : false,
        filenameBase = `${obj.host}_${obj.postId}`;

        if (!obj.isAudioOnly && !images) {
            video = obj.host === "tiktok" ? detail["video"]["play_addr"]["url_list"][0] : detail["video"]["play_addr"]["url_list"][0].replace("playwm", "play");
            videoFilename = `${filenameBase}_video_nw.mp4` // nw - no watermark
            if (!obj.noWatermark) {
                if (obj.host === "tiktok") {
                    let html = await got.get(`https://tiktok.com/@video/video/${obj.postId}`, { headers: { "user-agent": userAgent } });
                    html = html.body;
                    if (html.includes(',"preloadList":[{"url":"')) {
                        video = unicodeDecode(html.split(',"preloadList":[{"url":"')[1].split('","id":"')[0].trim())
                    }
                } else {
                    video = detail['video']['play_addr']['url_list'][0]
                }
                videoFilename = `${filenameBase}_video.mp4`
            }
        } else {
            let fallback = obj.host === "douyin" ? detail["video"]["play_addr"]["url_list"][0].replace("playwm", "play") : detail["video"]["play_addr"]["url_list"][0];
            if (obj.fullAudio || fallback.includes("music")) {
                audio = detail["music"]["play_url"]["url_list"][0]
                audioFilename = `${filenameBase}_audio`
            } else {
                audio = fallback
                audioFilename = `${filenameBase}_audio_fv` // fv - from video
            }
            if (audio.slice(-4) === ".mp3") isMp3 = true;
        }
        if (video) return {
            urls: video,
            filename: videoFilename
        }
        if (images && obj.isAudioOnly) {
            return {
                urls: audio,
                audioFilename: audioFilename,
                isAudioOnly: true,
                isMp3: isMp3,
            }
        }
        if (images) {
            let imageLinks = [];
            for (let i in images) {
                imageLinks.push({url: images[i]["display_image"]["url_list"][0]})
            }
            return {
                picker: imageLinks,
                urls: audio,
                audioFilename: audioFilename,
                isAudioOnly: true,
                isMp3: isMp3,
            }
        }
        if (audio) return {
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            isMp3: isMp3,
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
