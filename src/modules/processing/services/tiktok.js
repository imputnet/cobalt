import { genericUserAgent } from "../../config.js";
import { updateCookie } from "../cookie/manager.js";
import { extract } from "../url.js";
import Cookie from "../cookie/cookie.js";

const shortDomain = "https://vt.tiktok.com/";
export const cookie = new Cookie({})

export default async function(obj) {
    let postId = obj.postId
    let username = obj.user

    if (!username || !postId) {
        let html = await fetch(`${shortDomain}${obj.id}`, {
            redirect: "manual",
            headers: {
                "user-agent": genericUserAgent.split(' Chrome/1')[0]
            }
        }).then(r => r.text()).catch(() => {});

        if (!html) return { error: 'ErrorCouldntFetch' };

        if (html.startsWith('<a href="https://')) {
            const { patternMatch } = extract(html.split('<a href="https://')[1].split('?')[0])
            username = patternMatch.user
            postId = patternMatch.postId
        }
    }
    if (!username || !postId) return { error: 'ErrorCantGetID' };

    // should always be /video/, even for photos
    const res = await fetch(`https://tiktok.com/${username}/video/${postId}`, {
        headers: {
            "user-agent": genericUserAgent,
            cookie,
        }
    })
    updateCookie(cookie, res.headers)

    const html = await res.text()

    let detail
    try {
        const json = html
            .split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1]
            .split('</script>')[0]
        const data = JSON.parse(json)
        detail = data["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"]
    } catch {
        return { error: 'ErrorCouldntFetch' };
    }

    let video, videoFilename, audioFilename, audio, images,
        filenameBase = `tiktok_${detail.author.uniqueId}_${postId}`,
        bestAudio = 'm4a';

    images = detail.imagePost?.images;

    let playAddr = detail.video.playAddr;
    if (obj.h265) {
        const h265PlayAddr = detail.video.bitrateInfo.find(b => b.CodecType.contains("h265"))?.PlayAddr.UrlList[0]
        playAddr = h265PlayAddr || playAddr
    }

    if (!obj.isAudioOnly && !images) {
        video = playAddr;
        videoFilename = `${filenameBase}.mp4`;
    } else {
        audio = detail.music.playUrl || playAddr;
        audioFilename = `${filenameBase}_audio`;
        if (audio.endsWith(".mp3")) bestAudio = 'mp3';
    }

    if (video) return {
        urls: video,
        filename: videoFilename
    }
    if (images && obj.isAudioOnly) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        bestAudio
    }
    if (images) {
        let imageLinks = images
            .map(i => i.imageURL.urlList.find(p => p.includes(".jpeg?")))
            .map(url => ({ url }))
        return {
            picker: imageLinks,
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio
        }
    }
    if (audio) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        bestAudio
    }
}
