import { genericUserAgent } from "../../config.js";

export default async function({ id }) {
    const req = await fetch(`https://odysee.com/${id}`, {
        method: "GET",
        headers: {
            "user-agent": genericUserAgent
        }
    })
    .then(req => {return req.text()})
    .catch(() => {});

    // i couldn't find any other way to do this
    var reqlines = req.split('\n');
    var contentline = reqlines[reqlines.length - 32];
    var videoUrl = contentline.split('"')[3];

    if (videoUrl?.includes('.mp4')) {
        return {
            urls: videoUrl,
            filename: `odysee_${id}.mp4`,
            audioFilename: `odysee_${id}_audio`
        }
    }

    return { error: 'ErrorEmptyDownload' }
}
