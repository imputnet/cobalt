import { strict as assert } from "node:assert";

import { genericUserAgent } from "../../config.js";

/*
    pr0gramm is an imageboard. every upload ("item") is a single image or a video,
    and all media is served from plain cdn hosts without any login.

    the api returns bare paths (e.g. `2026/10/09/<hash>-h264-sd.mp4`), so the host
    has to be picked based on what is being downloaded:

      - `image` / `fullsize` -> img.pr0gramm.com (images)
      - `image` (when the item is a video) / `variants` -> vid.pr0gramm.com
      - `thumb` -> thumb.pr0gramm.com (smaller re-encode, jpeg/webp)

    videos come as h264 and vp9 variants. h264 always has audio, vp9 usually
    doesn't, so h264 is used for audio downloads.
*/

const mediaHosts = {
    image: "https://img.pr0gramm.com/",
    video: "https://vid.pr0gramm.com/",
    thumb: "https://thumb.pr0gramm.com/",
};

export const mediaURL = (path, host = "image") => {
    assert(mediaHosts[host]);
    return new URL(path, mediaHosts[host]).toString();
};

const videoExtensions = ["mp4", "webm", "mov", "mkv"];

const fileExtension = (path) => path?.split(".").pop().toLowerCase();

// videos live on vid. and images on img., and both hosts are happy to serve
// the other type — but only with the extension the path actually has, so it
// has to be taken from the path itself
export const mediaURLFor = (path) => mediaURL(
    path,
    videoExtensions.includes(fileExtension(path)) ? "video" : "image"
);

/*
    pr0gramm does not always keep its media paths up to date: an item that was
    converted after its upload has the old path in `fullsize` (e.g. a `.png`
    that is really served as `.jpg`), and a video without any h264/vp9 variant
    has only its `image` path. so the reachable one is probed instead of
    trusting whichever field happens to be filled.
*/
const pickReachableMedia = async (candidates) => {
    for (const path of candidates) {
        if (!path) continue;

        const url = mediaURLFor(path),
            reachable = await fetch(url, {
                method: "HEAD",
                headers: { "user-agent": genericUserAgent }
            }).then(r => r.ok).catch(() => false);

        if (reachable) {
            return { url, extension: fileExtension(path) };
        }
    }
};

/*
    variants are named `<codec>-<height class>`, and the height classes are
    consistent across qualities (sd is always 480p, hd always 720p, ...), so they
    are a more reliable source for picking a quality than the api heights.
*/
const heightClasses = {
    low_res: 360,
    sd: 480,
    hd: 720,
    full_hd: 1080,
    ultra_hd: 2160,
    "4k": 2160,
    "8k": 4320,
};

const videoTypes = [
    { mimeType: "video/mp4", extension: "mp4", codecs: ["h264", "hevc", "av1"] },
    { mimeType: "video/webm", extension: "webm", codecs: ["vp9", "av1"] },
];

const getVideoType = (variant) =>
    videoTypes.find(type => type.mimeType === variant?.mimeType);

export const selectVariant = (variants, quality, codec = "h264") => {
    const parsed = (variants || [])
        .filter(variant => variant?.path && getVideoType(variant))
        .map(variant => ({
            ...variant,
            height: heightClasses[variant.name?.split("-").pop()]
                        || variant.height
                        || 0,
        }))
        .sort((a, b) => a.height - b.height);

    if (!parsed.length) return;

    // prefer the requested codec, but never fail just because it's missing
    const sameCodec = parsed.filter(variant => variant.codec === codec);
    const candidates = sameCodec.length ? sameCodec : parsed;

    const target = quality === "max" ? Infinity : parseInt(quality) || 1080;
    return candidates.findLast(variant => variant.height <= target)
           ?? candidates[0];
};

const getFilename = (item, extension, qualityLabel, resolution) => ({
    filenameAttributes: {
        service: "pr0gramm",
        id: `${item.id}`,
        title: `pr0gramm ${item.id}`,
        ...(item.user && { author: item.user }),
        ...(extension && { extension }),
        ...(qualityLabel && { qualityLabel: `${qualityLabel}p` }),
        ...(resolution?.width && {
            resolution: `${resolution.width}x${resolution.height}`,
        }),
    },
    fileMetadata: {
        title: `${item.user ? `${item.user} - ` : ""}pr0gramm ${item.id}`,
        ...(item.user && { artist: item.user }),
        ...(item.created && {
            date: new Date(item.created * 1000).toISOString().split("T")[0],
        }),
    },
});

async function getItem(id) {
    const api = new URL("https://pr0gramm.com/api/items/get");
    api.searchParams.set("id", id);
    // `flags` is required by the api. 1 = sfw, the only flag that is
    // visible without an account
    api.searchParams.set("flags", "1");

    const response = await fetch(api, {
        headers: { "user-agent": genericUserAgent }
    }).catch(() => {});

    if (!response?.ok) return;

    const data = await response.json().catch(() => {});
    if (data?.error) return;

    // the api returns items *starting* at the requested id, so it has to be
    // looked up explicitly. `id` is a number in the response
    return data?.items?.find(item => item.id === +id);
}

export default async function ({ id, quality, isAudioOnly }) {
    const item = await getItem(id);
    if (!item) return { error: "fetch.empty" };

    const video = selectVariant(
        item.variants,
        isAudioOnly ? "max" : quality,
        "h264"
    );

    if (isAudioOnly) {
        if (!video) return { error: "fetch.empty" };

        return {
            urls: mediaURL(video.path, "video"),
            audioFilename: `pr0gramm_${item.id}_audio`,
            fileMetadata: getFilename(item).fileMetadata,
        };
    }

    if (!video) {
        // uploads without any video variant are images
        const photo = await pickReachableMedia([ item.image, item.fullsize ]);
        if (!photo) return { error: "fetch.empty" };

        return {
            urls: photo.url,
            // photos have no quality labels, so a plain filename reads better
            // than the "… ()" that the filename styles would produce
            filename: `pr0gramm_${item.id}.${photo.extension}`,
            // the rare video without any variants is still a video, and
            // shouldn't be saved as a photo
            ...(!videoExtensions.includes(photo.extension) && { isPhoto: true }),
        };
    }

    const type = getVideoType(video),
        // pr0gramm transcribes audio uploads and renders the default subtitle
        // against the sd variant
        subtitle = item.audio
            ? item.subtitles?.find(sub => sub.isDefault)
            : undefined;

    return {
        urls: mediaURL(video.path, "video"),
        ...getFilename(item, type.extension, video.height, video),
        ...(subtitle && { subtitles: mediaURL(subtitle.path, "video") }),
    };
}
