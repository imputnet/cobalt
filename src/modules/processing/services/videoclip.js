import { genericUserAgent } from "../../config.js";

export default async function({ id }) {
    const modifiedId = id.split("_")[0]
    const requestText = await fetch(`https://videoclip.bg/watch/${id}`, {
        method: "GET",
        headers: {
            "user-agent": genericUserAgent
        }
    })
    .then(req => {return req.text()})
    .catch(() => {});

    var videoTag = requestText.split('<video')[1];
    var videoSource = videoTag.split(">")[1].split('<source')[1].split('"')[1].split('//')[1];
    if (videoSource.endsWith(".mpd")) {
        videoSource = videoTag.split(">")[2].split('<source')[1].split('"')[1].split('//')[1];
    } else if (!videoSource.endsWith(".mp4")) {
        return { error: 'ErrorCouldntFetch'};
    }

    if (videoSource) {
        return {
            urls: "https://" + videoSource,
            filename: `videoclip_${modifiedId}.mp4`,
            audioFilename: `videoclip_${modifiedId}_audio`
        }
    }

    return { error: 'bErrorEmptyDownload' }
}