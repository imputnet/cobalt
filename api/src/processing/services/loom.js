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

async function getTranscript(id) {
    const gql = await fetch(`https://www.loom.com/graphql`, {
        method: "POST",
        headers: craftHeaders(id),
        body: JSON.stringify({
            operationName: "FetchVideoTranscriptForFetchTranscript",
            variables: {
                videoId: id,
                password: null,
            },
            query: `
                query FetchVideoTranscriptForFetchTranscript($videoId: ID!, $password: String) {
                    fetchVideoTranscript(videoId: $videoId, password: $password) {
                        ... on VideoTranscriptDetails {
                        captions_source_url
                        language
                        __typename
                        }
                        ... on GenericError {
                        message
                        __typename
                        }
                        __typename
                    }
                }`,
        })
    })
    .then(r => r.status === 200 && r.json())
    .catch(() => {});

    if (gql?.data?.fetchVideoTranscript?.captions_source_url?.includes('.vtt?')) {
        return gql.data.fetchVideoTranscript.captions_source_url;
    }
}

export async function fromSharePageHLS(id) {
    // newer loom videos are stored as HLS-only on luna.loom.com and the
    // transcoded-url/raw-url endpoints return 204 for them. the share page
    // embeds a GraphQL cache with a cloudfront-signed HLS master playlist.
    const html = await fetch(`https://www.loom.com/share/${id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then(r => r.ok && r.text()).catch(() => {});

    if (!html) return;

    // find the graphql cache entry for an M3U8 signed url, then take the
    // url value that follows it. tolerant of escaped quotes and slashes.
    for (const entry of html.matchAll(/nullableRawCdnUrl\([^)]*M3U8[^)]*\)/g)) {
        const window = html.slice(entry.index, entry.index + 3000);
        const url = window.match(
            /"url":\\?"(https:\\?\/\\?\/luna\.loom\.com[^"\\]*(?:\\.[^"\\]*)*)"/
        )?.[1];

        if (url?.includes(".m3u8")) {
            return url.replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        }
    }
}

export default async function({ id, subtitleLang }) {
    let url = await fromTranscodedURL(id);
    url ??= await fromRawURL(id);

    let isHLS = false;
    if (!url) {
        url = await fromSharePageHLS(id);
        isHLS = !!url;
    }

    if (!url) {
        return { error: "fetch.empty" }
    }

    let subtitles;
    if (subtitleLang) {
        const transcript = await getTranscript(id);
        if (transcript) subtitles = transcript;
    }

    return {
        urls: url,
        isHLS,
        subtitles,
        filename: `loom_${id}.mp4`,
        audioFilename: `loom_${id}_audio`
    }
}
