import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

// threads.com serves a minimal logged-out gating shell to requests that
// lack a believable browser fingerprint. sending the full set of headers
// a real chrome navigation sends makes it return the post page with the
// media data embedded as json (same behaviour as instagram embeds).
const browserHeaders = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-GB,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Dnt": "1",
    "Priority": "u=0, i",
    "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "macOS",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": genericUserAgent,
}

const sjsRegex = /<script type="application\/json"[^>]*\bdata-sjs\b[^>]*>(.*?)<\/script>/gs;

// recursively collect every thread_items[*].post object found in a parsed
// data-sjs payload. threads pages embed the requested post alongside its
// parent posts and replies, so callers must match on post.code themselves.
function collectPosts(node, out) {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node.thread_items)) {
        for (const item of node.thread_items) {
            if (item?.post?.code) out.push(item.post);
        }
    }

    for (const value of Object.values(node)) {
        collectPosts(value, out);
    }
}

// parse the embedded data-sjs json blocks and return the post object
// whose shortcode matches postId exactly (or null if not present).
function findPostData(html, postId) {
    if (typeof html !== "string") return null;

    const posts = [];
    for (const [, block] of html.matchAll(sjsRegex)) {
        let parsed;
        try {
            parsed = JSON.parse(block);
        } catch {
            continue;
        }
        collectPosts(parsed, posts);
    }

    return posts.find(post => post.code === postId) || null;
}

// threads video_versions entries carry no dimensions and (for a given
// post) all point at the same file, so the first valid url is the pick.
const pickVideo = (versions) => versions?.find(v => v?.url)?.url;

// image_versions2.candidates are ordered largest-first, same as instagram
const pickImage = (candidates) => candidates?.find(c => c?.url)?.url;

function mediaFromItem(item) {
    const video = pickVideo(item?.video_versions);
    if (video) return { type: "video", url: video };

    const photo = pickImage(item?.image_versions2?.candidates);
    if (photo) return { type: "photo", url: photo };
}

// turn a threads post object into a cobalt extractor result
function extractPost(post, id, { alwaysProxy } = {}) {
    if (!post) return { error: "fetch.empty" };

    // GIF: giphy serves these as an actual .gif, no conversion needed
    const gif = post.giphy_media_info?.images?.fixed_height?.url;
    if (gif) {
        return {
            urls: gif,
            isPhoto: true,
            filename: `threads_${id}.gif`,
        }
    }

    // carousel (multi-media post)
    if (Array.isArray(post.carousel_media) && post.carousel_media.length) {
        const picker = post.carousel_media
            .map((item, i) => {
                const media = mediaFromItem(item);
                if (!media) return;

                const itemExt = media.type === "video" ? "mp4" : "jpg";

                let url = media.url;
                if (alwaysProxy) url = createStream({
                    service: "threads",
                    type: "proxy",
                    url,
                    filename: `threads_${id}_${i + 1}.${itemExt}`,
                });

                const thumb = pickImage(item.image_versions2?.candidates);

                return {
                    type: media.type,
                    url,
                    /* thumbnails are served with a restrictive
                    ** Cross-Origin-Resource-Policy, so we proxy them */
                    thumb: thumb && createStream({
                        service: "threads",
                        type: "proxy",
                        url: thumb,
                        filename: `threads_${id}_${i + 1}.jpg`,
                    }),
                }
            })
            .filter(Boolean);

        if (picker.length) return { picker };
        return { error: "fetch.empty" };
    }

    // single video
    const video = pickVideo(post.video_versions);
    if (video) {
        return {
            urls: video,
            filename: `threads_${id}.mp4`,
            audioFilename: `threads_${id}_audio`,
        }
    }

    // single photo
    const photo = pickImage(post.image_versions2?.candidates);
    if (photo) {
        return {
            urls: photo,
            isPhoto: true,
            filename: `threads_${id}.jpg`,
        }
    }

    // reshares wrap the original post's media inside text_post_app_info.
    // threads uses (at least) two distinct fields for this:
    //   - share_info.quoted_attachment_post : the "use media" reshare
    //   - linked_inline_media               : a linked-inline repost
    // both carry a full post-shaped object, so we recurse into whichever is
    // present and return the first that resolves to media.
    const tpa = post.text_post_app_info;
    const wrappers = [
        tpa?.share_info?.quoted_attachment_post,
        tpa?.linked_inline_media,
    ];
    for (const wrapper of wrappers) {
        if (!wrapper) continue;
        const result = extractPost(wrapper, id, { alwaysProxy });
        if (!result.error) return result;
    }

    return { error: "fetch.empty" };
}

async function getPost({ user, postId, dispatcher }) {
    let html;
    try {
        const response = await fetch(
            `https://www.threads.com/@${user}/post/${postId}/`,
            { headers: browserHeaders, dispatcher }
        );

        if (response.status === 404 || response.status === 410)
            return { error: "content.post.unavailable" };

        if (response.status === 403 || response.status === 429)
            return { error: "fetch.rate" };

        if (!response.ok)
            return { error: "fetch.fail" };

        html = await response.text();
    } catch {
        return { error: "fetch.fail" };
    }

    const post = findPostData(html, postId);
    if (!post) return { error: "fetch.empty" };

    return post;
}

export default async function threads({ user, postId, alwaysProxy, dispatcher }) {
    if (!user || !postId) return { error: "fetch.empty" };

    const post = await getPost({ user, postId, dispatcher });
    if (post.error) return post;

    return extractPost(post, postId, { alwaysProxy });
}
