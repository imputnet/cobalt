import { genericUserAgent } from "../config.js";

let userAgent = genericUserAgent.split(' Chrome/1')[0]
let config = {
    tiktok: {
        short: "https://vt.tiktok.com/",
        api: "https://api2.musical.ly/aweme/v1/feed/?aweme_id={postId}&version_code=262&app_name=musical_ly&channel=App&device_id=null&os_version=14.4.2&device_platform=iphone&device_type=iPhone9&region=US&carrier_region=US",
    },
    douyin: {
        short: "https://v.douyin.com/",
        api: "https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={postId}",
    }
}
function selector(j, h, id) {
    if (j) {
        let t;
        switch (h) {
            case "tiktok":
                t = j["aweme_list"].filter((v) => { if (v["aweme_id"] == id) return true })
                break;
            case "douyin":
                t = j['item_list'].filter((v) => { if (v["aweme_id"] == id) return true })
                break;
        }
        if (t.length > 0) { return t[0] } else return false
    } else return false
}

export default async function(obj) {
    try {
        if (!obj.postId) {
            let html = await fetch(`${config[obj.host]["short"]}${obj.id}`, {
                redirect: "manual",
                headers: { "user-agent": userAgent }
            }).then(async (r) => {return r.text()}).catch(() => {return false});
            if (!html) return { error: 'ErrorCouldntFetch' };
            
            if (html.slice(0, 17) === '<a href="https://' && html.includes('/video/')) {
                obj.postId = html.split('/video/')[1].split('?')[0].replace("/", '')
            } else if (html.slice(0, 32) === '<a href="https://m.tiktok.com/v/' && html.includes('/v/')) {
                obj.postId = html.split('/v/')[1].split('.html')[0].replace("/", '')
            }
        }
        if (!obj.postId) return { error: 'ErrorCantGetID' };

        let detail;
        detail = await fetch(config[obj.host]["api"].replace("{postId}", obj.postId), {
            headers: {"user-agent": "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"}
        }).then(async (r) => {return r.json()}).catch(() => {return false});
        
        detail = selector(detail, obj.host, obj.postId);

        if (!detail) return { error: 'ErrorCouldntFetch' }

        let video, videoFilename, audioFilename, isMp3, audio, images,
        filenameBase = `${obj.host}_${obj.postId}`;
        if (obj.host == "tiktok") {
            images = detail["image_post_info"] ? detail["image_post_info"]["images"] : false
        } else {
            images = detail["images"] ? detail["images"] : false
        }
        if (!obj.isAudioOnly && !images) {
            video = obj.host === "tiktok" ? detail["video"]["play_addr"]["url_list"][0] : detail["video"]["play_addr"]["url_list"][0].replace("playwm", "play");
            videoFilename = `${filenameBase}_video_nw.mp4` // nw - no watermark
            if (!obj.noWatermark) {
                video = obj.host === "tiktok" ? detail["video"]["download_addr"]["url_list"][0] : detail['video']['play_addr']['url_list'][0]
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
                let sel = obj.host == "tiktok" ? images[i]["display_image"]["url_list"] : images[i]["url_list"];
                sel = sel.filter((p) => { if (p.includes(".jpeg?")) return true; })
                imageLinks.push({url: sel[0]})
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
        return { error: 'ErrorBadFetch' };
    }
}
