import HLS from "hls-parser";
import { cobaltUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

const extractVideo = async ({ media, filename, dispatcher }) => {
    let urlMasterHLS = media?.playlist;

    if (!urlMasterHLS || !urlMasterHLS.startsWith("https://video.bsky.app/")) {
        return { error: "fetch.empty" };
    }

    urlMasterHLS = urlMasterHLS.replace(
        "video.bsky.app/watch/",
        "video.cdn.bsky.app/hls/"
    );

    const masterHLS = await fetch(urlMasterHLS, { dispatcher })
        .then(r => {
            if (r.status !== 200) return;
            return r.text();
        })
        .catch(() => {});

    if (!masterHLS) return { error: "fetch.empty" };

    const video = HLS.parse(masterHLS)
            ?.variants
            ?.reduce((a, b) => a?.bandwidth > b?.bandwidth ? a : b);

    const videoURL = new URL(video.uri, urlMasterHLS).toString();

    return {
        urls: videoURL,
        filename: `${filename}.mp4`,
        audioFilename: `${filename}_audio`,
        isHLS: true,
    }
}

const extractImages = ({ getPost, filename, alwaysProxy }) => {
    const images = getPost?.thread?.post?.embed?.images;

    if (!images || images.length === 0) {
        return { error: "fetch.empty" };
    }

    if (images.length === 1) return {
        urls: images[0].fullsize,
        isPhoto: true,
        filename: `${filename}.jpg`,
    }

    const picker = images.map((image, i) => {
        let url = image.fullsize;
        let proxiedImage = createStream({
            service: "bluesky",
            type: "proxy",
            url,
            filename: `${filename}_${i + 1}.jpg`,
        });

        if (alwaysProxy) url = proxiedImage;

        return {
            type: "photo",
            url,
            thumb: proxiedImage,
        }
    });

    return { picker };
}

export default async function ({ user, post, alwaysProxy, dispatcher }) {
    const apiEndpoint = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=0&parentHeight=0");
    apiEndpoint.searchParams.set(
        "uri",
        `at://${user}/app.bsky.feed.post/${post}`
    );

    const getPost = await fetch(apiEndpoint, {
        headers: {
            "user-agent": cobaltUserAgent,
        },
        dispatcher
    }).then(r => r.json()).catch(() => {});

    if (!getPost) return { error: "fetch.empty" };

    if (getPost.error) {
        switch (getPost.error) {
            case "NotFound":
            case "InternalServerError":
                return { error: "content.post.unavailable" };
            case "InvalidRequest":
                return { error: "link.unsupported" };
            default:
                return { error: "content.post.unavailable" };
        }
    }

    const embedType = getPost?.thread?.post?.embed?.$type;
    const filename = `bluesky_${user}_${post}`;

    if (embedType === "app.bsky.embed.video#view") {
        return extractVideo({
            media: getPost.thread?.post?.embed,
            filename,
        })
    }

    if (embedType === "app.bsky.embed.recordWithMedia#view") {
        return extractVideo({
            media: getPost.thread?.post?.embed?.media,
            filename,
        })
    }

    if (embedType === "app.bsky.embed.images#view") {
        return extractImages({ getPost, filename, alwaysProxy });
    }

    return { error: "fetch.empty" };
}
