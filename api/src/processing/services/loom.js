import { genericUserAgent } from "../../config.js";

export default async function({ id }) {
    const gql = await fetch(`https://www.loom.com/api/campaigns/sessions/${id}/transcoded-url`, {
        method: "POST",
        headers: {
            "user-agent": genericUserAgent,
            origin: "https://www.loom.com",
            referer: `https://www.loom.com/share/${id}`,
            cookie: `loom_referral_video=${id};`,

            "apollographql-client-name": "web",
            "apollographql-client-version": "14c0b42",
            "x-loom-request-source": "loom_web_14c0b42",
        },
        body: JSON.stringify({
            force_original: false,
            password: null,
            anonID: null,
            deviceID: null
        })
    })
    .then(r => r.status === 200 ? r.json() : false)
    .catch(() => {});

    if (!gql) return { error: "fetch.empty" };

    const videoUrl = gql?.url;

    if (videoUrl?.includes('.mp4?')) {
        return {
            urls: videoUrl,
            filename: `loom_${id}.mp4`,
            audioFilename: `loom_${id}_audio`
        }
    }

    return { error: "fetch.empty" }
}
