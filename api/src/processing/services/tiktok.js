import Cookie from "../cookie/cookie.js";

import { extract } from "../url.js";
import { genericUserAgent } from "../../config.js";
import { updateCookie } from "../cookie/manager.js";
import { createStream } from "../../stream/manage.js";

const shortDomain = "https://vt.tiktok.com/";

export default async function(obj) {
    // const cookie = new Cookie({});
    const cookie = obj.cookies;
    let postId = obj.postId;

    console.log("With TikTok using cookies", cookie);

    if (!postId) {
        let html = await fetch(`${shortDomain}${obj.shortLink}`, {
            redirect: "manual",
            headers: {
                "user-agent": genericUserAgent.split(' Chrome/1')[0]
            }
        }).then(r => r.text()).catch(() => {});

        if (!html) return { error: "fetch.fail" };

        if (html.startsWith('<a href="https://')) {
            const extractedURL = html.split('<a href="')[1].split('?')[0];
            const { patternMatch } = extract(extractedURL);
            postId = patternMatch.postId;
        }
    }
    if (!postId) return { error: "fetch.short_link" };

    // should always be /video/, even for photos
    const res = await fetch(`https://www.tiktok.com/@i/video/${postId}`, {
        headers: {
            "user-agent": genericUserAgent,
            cookie,
        }
    })
    updateCookie(cookie, res.headers);

    const html = await res.text();

    let detail;
    try {
        const json = html
            .split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1]
            .split('</script>')[0];

        const data = JSON.parse(json);
        const videoDetail = data["__DEFAULT_SCOPE__"]["webapp.video-detail"];

        if (!videoDetail) throw "no video detail found";

        // status_deleted or etc
        if (videoDetail.statusMsg) {
            return { error: "content.post.unavailable"};
        }

        detail = videoDetail?.itemInfo?.itemStruct;
    } catch {
        return { error: "fetch.fail" };
    }

    if (detail.isContentClassified) {
        return { error: "content.post.age" };
    }

    if (!detail.author) {
        return { error: "fetch.empty" };
    }

    let video, videoFilename, audioFilename, audio, images,
        filenameBase = `tiktok_${detail.author?.uniqueId}_${postId}`,
        bestAudio; // will get defaulted to m4a later on in match-action

    images = detail.imagePost?.images;

    let playAddr = detail.video?.playAddr;

    if (obj.h265) {
        const h265PlayAddr = detail?.video?.bitrateInfo?.find(b => b.CodecType.includes("h265"))?.PlayAddr.UrlList[0]
        playAddr = h265PlayAddr || playAddr
    }

    if (!obj.isAudioOnly && !images) {
        video = playAddr;
        videoFilename = `${filenameBase}.mp4`;
    } else {
        audio = playAddr;
        audioFilename = `${filenameBase}_audio`;

        if (obj.fullAudio || !audio) {
            audio = detail.music.playUrl;
            audioFilename += `_original`
        }
        if (audio.includes("mime_type=audio_mpeg")) bestAudio = 'mp3';
    }

    if (video) {
        return {
            urls: video,
            filename: videoFilename,
            headers: { cookie }
        }
    }

    if (images && obj.isAudioOnly) {
        return {
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }

    if (images) {
        let imageLinks = images
            .map(i => i.imageURL.urlList.find(p => p.includes(".jpeg?")))
            .map((url, i) => {
                if (obj.alwaysProxy) url = createStream({
                    service: "tiktok",
                    type: "proxy",
                    url,
                    filename: `${filenameBase}_photo_${i + 1}.jpg`
                })

                return {
                    type: "photo",
                    url
                }
            });

        return {
            picker: imageLinks,
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }

    if (audio) {
        return {
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            bestAudio,
            headers: { cookie }
        }
    }
}
