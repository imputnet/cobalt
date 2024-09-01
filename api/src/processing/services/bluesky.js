import HLS from "hls-parser";
import { cobaltUserAgent } from "../../config.js";

const extractVideo = async ({ getPost, filename }) => {
    const urlMasterHLS = getPost?.thread?.post?.embed?.playlist;
    if (!urlMasterHLS) return { error: "fetch.empty" };

    const masterHLS = await fetch(urlMasterHLS)
                        .then(r => r.text())
                        .catch(() => {});
    if (!masterHLS) return { error: "fetch.fail" };

    const video = HLS.parse(masterHLS)
                     ?.variants
                     ?.reduce((a, b) => a?.bandwidth > b?.bandwidth ? a : b);

    const videoURL = new URL(video.uri, urlMasterHLS).toString();

    return {
        urls: videoURL,
        filename: `${filename}.mp4`,
        audioFilename: `${filename}_audio`,
        isM3U8: true,
    }
}

export default async function ({ user, post }) {
    const apiEndpoint = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=0&parentHeight=0");
    apiEndpoint.searchParams.set(
        "uri",
        `at://${user}/app.bsky.feed.post/${post}`
    );

    const getPost = await fetch(apiEndpoint, {
        headers: {
            "user-agent": cobaltUserAgent
        }
    })
    .then(r => r.json())
    .catch(() => {});

    if (!getPost || getPost?.error) return { error: "fetch.empty" };

    const embedType = getPost?.thread?.post?.embed?.$type;
    const filename = `bluesky_${user}_${post}`;

    if (embedType === "app.bsky.embed.video#view") {
        return await extractVideo({ getPost, filename });
    }

    return { error: "fetch.empty" };
}
