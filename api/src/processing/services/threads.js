import { createStream } from "../../stream/manage.js";
import { getCookie, updateCookie } from "../cookie/manager.js";

const commonHeaders = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.7",
    "Cache-Control": "no-cache",
    "Dnt": "1",
    "Priority": "u=0, i",
    "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Model": '""',
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Ch-Ua-Platform-Version": '"15.0.0"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Gpc": "1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

const DATA_REGEX = /<script type="application\/json" {2}data-content-len="\d+" data-sjs>({"require":\[\["ScheduledServerJS","handle",null,\[{"__bbox":{"require":\[\["RelayPrefetchedStreamCache(?:(?:@|\\u0040)[0-9a-f]{32})?","next",\[],\["adp_BarcelonaPostPageQueryRelayPreloader_[0-9a-f]{23}",[^\n]+})<\/script>\n/;

export default async function({ user, id, quality, alwaysProxy, dispatcher }) {
    const cookie = getCookie("threads");
    const response = await fetch(`https://www.threads.net/${user}/post/${id}`, {
        headers: {
            ...commonHeaders,
            cookie
        },
        dispatcher
    });
    if (cookie) updateCookie(cookie, response.headers);

    if (response.status !== 200) {
        return { error: "fetch.fail" };
    }
    const html = await response.text();
    const dataString = html.match(DATA_REGEX)?.[1];
    if (!dataString) {
        return { error: "fetch.fail" };
    }

    const data = JSON.parse(dataString);
    const post = data?.require?.[0]?.[3]?.[0]?.__bbox?.require?.[0]?.[3]?.[1]?.__bbox?.result?.data?.data?.edges[0]?.node?.thread_items[0]?.post;
    if (!post) {
        return { error: "fetch.fail" };
    }

    const filenameBase = `threads_${post.user.username}_${post.code}`;

    // Video
    if (post.media_type === 2) {
        if (!post.video_versions) {
            return { error: "fetch.empty" };
        }

        // types: 640p = 101, 480p = 102, 480p-low = 103
        const selectedQualityType = quality === "max" ? 101 : quality && parseInt(quality) <= 480 ? 102 : 101;
        const video = post.video_versions.find((v) => v.type === selectedQualityType) || post.video_versions.sort((a, b) => a.type - b.type)[0];
        if (!video) {
            return { error: "fetch.empty" };
        }

        return {
            urls: video.url,
            filename: `${filenameBase}.mp4`,
            audioFilename: `${filenameBase}_audio`
        }
    }

    // Photo
    if (post.media_type === 1) {
        if (!post.image_versions2?.candidates) {
            return { error: "fetch.empty" };
        }

        return {
            urls: post.image_versions2.candidates[0].url,
            filename: `${filenameBase}.jpg`,
            isPhoto: true
        }
    }

    // Mixed
    if (post.media_type === 8) {
        if (!post.carousel_media) {
            return { error: "fetch.empty" };
        }

        return {
            picker: post.carousel_media.map((media, i) => {
                const type = media.video_versions ? "video" : "photo";
                let url = media.video_versions ? media.video_versions[0].url : media.image_versions2.candidates[0].url;
                const thumbProxy = createStream({
                    service: "threads",
                    type: "proxy",
                    u: media.image_versions2.candidates[0].url,
                    filename: `${filenameBase}_${i}.jpg`,
                });
                if (alwaysProxy) {
                    url = type === 'photo' ? thumbProxy : createStream({
                        service: "threads",
                        type: "proxy",
                        u: media.video_versions[0].url,
                        filename: `${filenameBase}_${i}.mp4`,
                    });
                }

                return {
                    type,
                    url,
                    thumb: thumbProxy
                }
            })
        }
    }

    return { error: "fetch.fail" };
}
