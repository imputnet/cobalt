import { genericUserAgent } from "../../config.js";

const genericHeaders = {
    "user-agent": genericUserAgent,
    "accept-language": "en-US,en;q=0.9",
}

const getVideoInfo = async (id, dispatcher, quality) => {
    const html = await fetch(`https://www.nicovideo.jp/watch/${id}`, {
        dispatcher,
        headers: genericHeaders
    }).then(r => r.text()).catch(() => {});

    if (!(html.includes("accessRightKey")
            || !(html.includes('<meta name="server-response" content="')))) {
        return { error: "fetch.fail" };
    }

    const rawContent =
        html.split('<meta name="server-response" content="')[1]
        .split('" />')[0]
        .replaceAll("&quot;", '"');

    const data = JSON.parse(rawContent)?.data?.response;

    if (!data) {
        return { error: "fetch.fail" };
    }

    const audio = data.media?.domand?.audios.find(audio => audio.isAvailable);
    const bestVideo = data.media?.domand?.videos.find(video => video.isAvailable);

    const preferredVideo = data.media?.domand?.videos.find(video =>
        video.isAvailable && video.label.split('p')[0] === quality
    );

    const video = preferredVideo || bestVideo;

    return {
        watchTrackId: data.client?.watchTrackId,
        accessRightKey: data.media?.domand?.accessRightKey,

        video,

        outputs: [[video.id, audio.id]],

        author: data.owner?.nickname,
        title: data.video?.title,
    }
}

const getHls = async (dispatcher, id, trackId, accessRightKey, outputs) => {
    const response = await fetch(
        `https://nvapi.nicovideo.jp/v1/watch/${id}/access-rights/hls?actionTrackId=${trackId}`,
        {
            method: "POST",
            dispatcher,
            headers: {
                ...genericHeaders,
                "content-type": "application/json",
                "x-access-right-key": accessRightKey,
                "x-frontend-id": "6",
                "x-frontend-version": "0",
                "x-request-with": "nicovideo",
            },
            body: JSON.stringify({
                outputs,
            })
        }
    ).then(r => r.json()).catch(() => {});

    if (!response?.data?.contentUrl) return;
    return response.data.contentUrl;
}

export default async function ({ id, dispatcher, quality }) {
    const {
        watchTrackId,
        accessRightKey,
        video,
        outputs,
        author,
        title,
        error
    } = await getVideoInfo(id, dispatcher, quality);

    if (error) {
        return { error };
    }

    if (!watchTrackId || !accessRightKey || !outputs) {
        return { error: "fetch.empty" };
    }

    const hlsUrl = await getHls(
        dispatcher,
        id,
        watchTrackId,
        accessRightKey,
        outputs
    );

    if (!hlsUrl) {
        return { error: "fetch.empty" };
    }

    return {
        urls: hlsUrl,
        isHLS: true,
        filenameAttributes: {
            service: "nicovideo",
            id,
            title,
            author,
            resolution: `${video.width}x${video.height}`,
            qualityLabel: `${video.label}`,
            extension: "mp4"
        }
    }
}
