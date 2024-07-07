import { genericUserAgent } from "../../config.js";

export default async function({ id }) {
    const requestText = await fetch(`https://odysee.com/${id}`, {
        method: "GET",
        headers: {
            "user-agent": genericUserAgent
        }
    })
    .then(req => req.text())
    .catch(() => {});

    if (!requestText.includes('"contentUrl": ')) return { error: 'ErrorEmptyDownload' };
    var videoUrl = requestText.split('"contentUrl": "')[1].split('"')[0];

    if (videoUrl?.includes('.mp4')) {
        return {
            urls: videoUrl,
            filename: `odysee_${id}.mp4`,
            audioFilename: `odysee_${id}_audio`
        }
    }

    return { error: 'ErrorEmptyDownload' }
}
