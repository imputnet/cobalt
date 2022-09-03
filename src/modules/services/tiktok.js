import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";
import { unicodeDecode } from "../sub/utils.js";

let userAgent = genericUserAgent.split(' Chrome/1')[0]
let config = {
    tiktok: {
        short: "https://vt.tiktok.com/",
        api: "https://api.tiktokv.com/aweme/v1/aweme/detail/?aweme_id=",
    },
    douyin: {
        short: "https://v.douyin.com/",
        api: "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=",
    }
}
function selector(j, h) {
    switch (h) {
        case "tiktok":
            return j["aweme_detail"]
        case "douyin":
            return j['item_list'][0]
    }
}

export default async function(obj) {
    try {
        if (!obj.postId) {
            let html = await got.get(`${config[obj.host]["short"]}${obj.id}`, { followRedirect: false, headers: { "user-agent": userAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', obj.host) };
            });
            html = html.body;
            if (html.slice(0, 17) === '<a href="https://' && html.includes('/video/')) obj.postId = html.split('video/')[1].split('?')[0].replace("/", '')
        }
        if (!obj.postId) return { error: loc(obj.lang, 'ErrorCantGetID') };
    
        let detail = await got.get(`${config[obj.host]["api"]}${obj.postId}`);
        detail.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', obj.host) };
        });
        detail = selector(JSON.parse(detail.body), obj.host);

        let video, videoFilename, audioFilename, isMp3, audio,
        images = detail["image_post_info"] ? detail["image_post_info"]["images"] : false,
        filenameBase = `${obj.host}_${obj.postId}`;

        if (!obj.isAudioOnly && !images) {
            if (obj.host == "tiktok") {
                video = detail["video"]["play_addr"]["url_list"][0]
            } else {
                video = detail["video"]["play_addr"]["url_list"][0].replace("playwm", "play")
            }
            videoFilename = `${filenameBase}_video_nw.mp4` // nw - no watermark
            if (!obj.noWatermark) {
                if (obj.host == "tiktok") {
                    let html = await got.get(`https://tiktok.com/@video/video/${obj.postId}`, { headers: { "user-agent": userAgent } });
                    html.on('error', (err) => {
                        return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', obj.host) };
                    });
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
            let fallback = obj.host == "douyin" ? detail["video"]["play_addr"]["url_list"][0].replace("playwm", "play") : detail["video"]["play_addr"]["url_list"][0];
            if (obj.fullAudio || fallback.includes("music")) {
                audio = detail["music"]["play_url"]["url_list"][0]
                audioFilename = `${filenameBase}_audio`
            } else {
                audio = fallback
                audioFilename = `${filenameBase}_audio_fv` // fv - from video
            }
            if (audio.slice(-4) == ".mp3") isMp3 = true;
        }
        if (video) return {
            urls: video,
            filename: videoFilename
        }
        if (images) {
            let imageLinks = [];
            for (let i in images) {
                imageLinks.push(images[i]["display_image"]["url_list"][0])
            }
            return {
                images: imageLinks,
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
