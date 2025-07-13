import { genericUserAgent } from "../../config.js";

const getVideo = async ({ id, quality }) => {
    const json = await fetch(`https://www.newgrounds.com/portal/video/${id}`, {
        headers: {
            "User-Agent": genericUserAgent,
            "X-Requested-With": "XMLHttpRequest", // required to get the JSON response
        }
    })
    .then(r => r.json())
    .catch(() => {});

    if (!json) return { error: "fetch.empty" };

    const videoSources = json.sources;
    const videoQualities = Object.keys(videoSources);

    if (videoQualities.length === 0) {
        return { error: "fetch.empty" };
    }

    const bestVideo = videoSources[videoQualities[0]]?.[0],
          userQuality = quality === "2160" ? "4k" : `${quality}p`,
          preferredVideo = videoSources[userQuality]?.[0],
          video = preferredVideo || bestVideo,
          videoQuality = preferredVideo ? userQuality : videoQualities[0];

    if (!bestVideo || !video.type.includes("mp4")) {
        return { error: "fetch.empty" };
    }

    const fileMetadata = {
        title: decodeURIComponent(json.title),
        artist: decodeURIComponent(json.author),
    }

    return {
        urls: video.src,
        filenameAttributes: {
            service: "newgrounds",
            id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            extension: "mp4",
            qualityLabel: videoQuality,
            resolution: videoQuality,
        },
        fileMetadata,
    }
}

const getMusic = async ({ id }) => {
    const html = await fetch(`https://www.newgrounds.com/audio/listen/${id}`, {
        headers: {
            "User-Agent": genericUserAgent,
        }
    })
    .then(r => r.text())
    .catch(() => {});

    if (!html) return { error: "fetch.fail" };

    const params = JSON.parse(
        `{${html.split(',"params":{')[1]?.split(',"images":')[0]}}`
    );
    if (!params) return { error: "fetch.empty" };

    if (!params.name || !params.artist || !params.filename || !params.icon) {
        return { error: "fetch.empty" };
    }

    const fileMetadata = {
        title: decodeURIComponent(params.name),
        artist: decodeURIComponent(params.artist),
    }

    return {
        urls: params.filename,
        filenameAttributes: {
            service: "newgrounds",
            id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
        },
        fileMetadata,
        cover:
            params.icon.includes(".png?") || params.icon.includes(".jpg?")
                ? params.icon
                : undefined,
        isAudioOnly: true,
        bestAudio: "mp3",
    }
}

export default function({ id, audioId, quality }) {
    if (id) {
        return getVideo({ id, quality });
    } else if (audioId) {
        return getMusic({ id: audioId });
    }

    return { error: "fetch.empty" };
}
