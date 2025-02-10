import { resolveRedirectingURL } from "../url.js";
import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

const https = (url) => {
    return url.replace(/^http:/i, 'https:');
}

export default async function ({ id, token, shareId, h265, isAudioOnly, dispatcher }) {
    let noteId = id;
    let xsecToken = token;

    if (!noteId) {
        const patternMatch = await resolveRedirectingURL(
            `https://xhslink.com/a/${shareId}`,
            dispatcher
        );

        noteId = patternMatch?.id;
        xsecToken = patternMatch?.token;
    }

    if (!noteId || !xsecToken) return { error: "fetch.short_link" };

    const res = await fetch(`https://www.xiaohongshu.com/explore/${noteId}?xsec_token=${xsecToken}`, {
        headers: {
            "user-agent": genericUserAgent,
        },
        dispatcher,
    });

    const html = await res.text();

    let note;
    try {
        const initialState = html
            .split('<script>window.__INITIAL_STATE__=')[1]
            .split('</script>')[0]
            .replace(/:\s*undefined/g, ":null");

        const data = JSON.parse(initialState);

        const noteInfo = data?.note?.noteDetailMap;
        if (!noteInfo) throw "no note detail map";

        const currentNote = noteInfo[noteId];
        if (!currentNote) throw "no current note in detail map";

        note = currentNote.note;
    } catch {}

    if (!note) return { error: "fetch.empty" };

    const video = note.video;
    const images = note.imageList;

    const filenameBase = `xiaohongshu_${noteId}`;

    if (video) {
        const videoFilename = `${filenameBase}.mp4`;
        const audioFilename = `${filenameBase}_audio`;

        let videoURL;

        if (h265 && !isAudioOnly && video.consumer?.originVideoKey) {
            videoURL = `https://sns-video-bd.xhscdn.com/${video.consumer.originVideoKey}`;
        } else {
            const h264Streams = video.media?.stream?.h264;

            if (h264Streams?.length) {
                videoURL = h264Streams.reduce((a, b) => Number(a?.videoBitrate) > Number(b?.videoBitrate) ? a : b).masterUrl;
            }
        }

        if (!videoURL) return { error: "fetch.empty" };

        return {
            urls: https(videoURL),
            filename: videoFilename,
            audioFilename: audioFilename,
        }
    }

    if (!images || images.length === 0) {
        return { error: "fetch.empty" };
    }

    if (images.length === 1) {
        return {
            isPhoto: true,
            urls: https(images[0].urlDefault),
            filename: `${filenameBase}.jpg`,
        }
    }

    const picker = images.map((image, i) => {
        return {
            type: "photo",
            url: createStream({
                service: "xiaohongshu",
                type: "proxy",
                url: https(image.urlDefault),
                filename: `${filenameBase}_${i + 1}.jpg`,
            })
        }
    });

    return { picker };
}
