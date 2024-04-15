import { genericUserAgent } from "../../config.js";

const shortDomain = "https://vt.tiktok.com/";
const apiPath = "https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?region=US&carrier_region=US";
const apiUserAgent = "TikTok/338014 CFNetwork/1410.1 Darwin/22.6.0";

export default async function(obj) {
    let postId = obj.postId ? obj.postId : false;

    if (!process.env.TIKTOK_DEVICE_INFO) return { error: 'ErrorCouldntFetch' };

    if (!postId) {
        let html = await fetch(`${shortDomain}${obj.id}`, {
            redirect: "manual",
            headers: {
                "user-agent": genericUserAgent.split(' Chrome/1')[0]
            }
        }).then(r => r.text()).catch(() => {});

        if (!html) return { error: 'ErrorCouldntFetch' };

        if (html.slice(0, 17) === '<a href="https://') {
            postId = html.split('<a href="https://')[1].split('?')[0].split('/')[3]
        } else if (html.slice(0, 32) === '<a href="https://m.tiktok.com/v/' && html.includes('/v/')) {
            postId = html.split('/v/')[1].split('.html')[0].replace("/", '')
        }
    }
    if (!postId) return { error: 'ErrorCantGetID' };

    let deviceInfo = JSON.parse(process.env.TIKTOK_DEVICE_INFO);
        deviceInfo = new URLSearchParams(deviceInfo).toString();

    let apiURL = new URL(apiPath);
        apiURL.searchParams.append("aweme_id", postId);

    let detail = await fetch(`${apiURL.href}&${deviceInfo}`, {
        headers: {
            "user-agent": apiUserAgent
        }
    }).then(r => r.json()).catch(() => {});

    detail = detail?.aweme_list?.find(v => v.aweme_id === postId);
    if (!detail) return { error: 'ErrorCouldntFetch' };

    let video, videoFilename, audioFilename, isMp3, audio, images,
        filenameBase = `tiktok_${detail.author.unique_id}_${postId}`;

    images = detail.image_post_info?.images;

    let playAddr = detail.video.play_addr_h264;

    if (!playAddr) playAddr = detail.video.play_addr;

    if (!obj.isAudioOnly && !images) {
        video = playAddr.url_list[0];
        videoFilename = `${filenameBase}.mp4`;
    } else {
        let fallback = playAddr.url_list[0];
        audio = fallback;
        audioFilename = `${filenameBase}_audio_fv`;  // fv - from video
        if (obj.fullAudio || fallback.includes("music")) {
            audio = detail.music.play_url.url_list[0]
            audioFilename = `${filenameBase}_audio`
        }
        if (audio.slice(-4) === ".mp3") isMp3 = true;
    }

    if (video) return {
        urls: video,
        filename: videoFilename
    }
    if (images && obj.isAudioOnly) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        isMp3: isMp3
    }
    if (images) {
        let imageLinks = [];
        for (let i in images) {
            let sel = images[i].display_image.url_list;
            sel = sel.filter(p => p.includes(".jpeg?"))
            imageLinks.push({url: sel[0]})
        }
        return {
            picker: imageLinks,
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            isMp3: isMp3
        }
    }
    if (audio) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        isMp3: isMp3
    }
}
