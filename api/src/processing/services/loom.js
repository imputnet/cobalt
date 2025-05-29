import { genericUserAgent } from "../../config.js";

const craftHeaders = id => ({
    "user-agent": genericUserAgent,
    "content-type": "application/json",
    origin: "https://www.loom.com",
    referer: `https://www.loom.com/share/${id}`,
    cookie: `loom_referral_video=${id};`,
    "x-loom-request-source": "loom_web_be851af",
});

async function fromTranscodedURL(id) {
    const gql = await fetch(`https://www.loom.com/api/campaigns/sessions/${id}/transcoded-url`, {
        method: "POST",
        headers: craftHeaders(id),
        body: JSON.stringify({
            force_original: false,
            password: null,
            anonID: null,
            deviceID: null
        })
    })
    .then(r => r.status === 200 && r.json())
    .catch(() => {});

    if (gql?.url?.includes('.mp4?')) {
        return gql.url;
    }
}

async function fromRawURL(id) {
    const gql = await fetch(`https://www.loom.com/api/campaigns/sessions/${id}/raw-url`, {
        method: "POST",
        headers: craftHeaders(id),
        body: JSON.stringify({
            anonID: crypto.randomUUID(),
            client_name: "web",
            client_version: "be851af",
            deviceID: null,
            force_original: false,
            password: null,
            supported_mime_types: ["video/mp4"],
        })
    })
    .then(r => r.status === 200 && r.json())
    .catch(() => {});

    if (gql?.url?.includes('.mp4?')) {
        return gql.url;
    }
}

export default async function({ id }) {
    let url = await fromTranscodedURL(id);
    url ??= await fromRawURL(id);

    if (!url) {
        return { error: "fetch.empty" }
    }

    return {
        urls: url,
        filename: `loom_${id}.mp4`,
        audioFilename: `loom_${id}_audio`
    }
}
