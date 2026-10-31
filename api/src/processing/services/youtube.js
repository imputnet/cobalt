import HLS from "hls-parser";
import { fetch } from "undici";

import { env } from "../../config.js";
import { callYTubeDL } from "../helpers/ytubedl.js";

const codecList = {
    h264: {
        videoCodec: "avc1",
        audioCodec: "mp4a",
        container: "mp4"
    },
    av1: {
        videoCodec: "av01",
        audioCodec: "opus",
        container: "webm"
    },
    vp9: {
        videoCodec: "vp9",
        audioCodec: "opus",
        container: "webm"
    }
}

const hlsCodecList = {
    h264: {
        videoCodec: "avc1",
        audioCodec: "mp4a",
        container: "mp4"
    },
    vp9: {
        videoCodec: "vp09",
        audioCodec: "mp4a",
        container: "mp4"
    }
}

const videoQualities = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];

const engineError = result => {
    switch (result?.errorClass) {
        case "AgeRestrictedContentException":
            return "content.video.age";
        case "PrivateContentException":
            return "content.video.private";
        case "GeographicRestrictionException":
        case "UnsupportedContentInCountryException":
            return "content.video.region";
        case "PaidContentException":
        case "YoutubeMusicPremiumContentException":
            return "content.paid";
        case "ContentNotAvailableException":
        case "AccountTerminatedException":
            return "content.video.unavailable";
        case "ContentNotSupportedException":
            return "youtube.no_matching_format";
        case "DrmException":
            return "youtube.drm";
        case "ReCaptchaException":
            return "fetch.rate";
        default:
            return "youtube.engine";
    }
}

const getHlsVariants = async (hlsManifest, dispatcher) => {
    if (!hlsManifest) {
        return { error: "youtube.no_hls_streams" };
    }

    const fetchedHlsManifest =
        await fetch(hlsManifest, { dispatcher })
            .then(r => r.status === 200 ? r.text() : undefined)
            .catch(() => {});

    if (!fetchedHlsManifest) {
        return { error: "youtube.no_hls_streams" };
    }

    const variants = HLS.parse(fetchedHlsManifest).variants.sort(
        (a, b) => Number(b.bandwidth) - Number(a.bandwidth)
    );

    if (!variants || variants.length === 0) {
        return { error: "youtube.no_hls_streams" };
    }

    return variants;
}

const stripTags = html => html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

const isOriginalTrack = entry =>
    entry.audioTrackType === "ORIGINAL"
    || (entry.audioTrackName || "").toLowerCase().includes("original");

export default async function (o, { engineCall = callYTubeDL } = {}) {
    if (env.youtubeEngine === "off") {
        return { error: "service.unsupported" };
    }

    const quality = o.quality === "max" ? 9000 : Number(o.quality);

    // the engine only parses 11-char ids; short ones would fall through to its
    // direct-URL provider and surface as a misleading engine failure
    if (!/^[A-Za-z0-9_-]{11}$/.test(o.id)) {
        return { error: "content.video.unavailable" };
    }

    let useHLS = o.youtubeHLS;
    let codec = o.codec || "h264";

    // HLS playlists don't contain the av1 video format.
    if (useHLS && o.codec === "av1") {
        useHLS = false;
    }

    let result;
    try {
        result = await engineCall(`https://www.youtube.com/watch?v=${o.id}`, {
            dispatcher: o.dispatcher,
        });
    } catch (e) {
        // the adapter resolves instead of rejecting, so a throw here means
        // the adapter itself is broken
        console.error("[youtube] engine call failed:", e?.message || e);
        return { error: "youtube.engine" };
    }

    if (!result.ok) {
        console.error(
            "[youtube] engine extraction failed:",
            result.errorClass, "-", result.error
        );
        return { error: engineError(result) };
    }

    if (result.live) {
        return { error: "content.video.live" };
    }

    if (result.duration > env.durationLimit) {
        return { error: "content.too_long" };
    }

    // return a critical error if returned video is "Video Not Available"
    // or a similar stub by youtube
    if (result.id !== o.id) {
        return {
            error: "fetch.fail",
            critical: true
        }
    }

    // degradation contract from the integration plan: when the engine has
    // no HLS manifest for this video, fall back to the progressive path
    // instead of failing (HLS is opt-in via the deprecated youtubeHLS param)
    useHLS = useHLS && !!result.hls;

    const normalizeQuality = res => {
        const shortestSide = Math.min(res.height, res.width);
        return videoQualities.find(qual => qual >= shortestSide);
    }

    let video, audio, subtitles, dubbedLanguage;

    if (useHLS) {
        const variants = await getHlsVariants(result.hls, o.dispatcher);

        if (variants?.error) return variants;

        const matchHlsCodec = codecs => (
            codecs.includes(hlsCodecList[codec].videoCodec)
        );

        const best = variants.find(i => matchHlsCodec(i.codecs));

        const preferred = variants.find(i =>
            matchHlsCodec(i.codecs) && normalizeQuality(i.resolution) === quality
        );

        let selected = preferred || best;

        if (!selected) {
            codec = "h264";
            selected = variants.find(i => matchHlsCodec(i.codecs));
        }

        if (!selected) {
            return { error: "youtube.no_matching_format" };
        }

        audio = selected.audio.find(i => i.isDefault);

        // some videos (mainly those with AI dubs) don't have any tracks marked as default
        // why? god knows, but we assume that a default track is marked as such in the title
        if (!audio) {
            audio = selected.audio.find(i => i.name.endsWith("original"));
        }

        if (o.dubLang) {
            const dubbedAudio = selected.audio.find(i =>
                i.language?.startsWith(o.dubLang)
            );

            if (dubbedAudio && !dubbedAudio.isDefault) {
                dubbedLanguage = dubbedAudio.language;
                audio = dubbedAudio;
            }
        }

        selected.audio = [];
        selected.subtitles = [];
        video = selected;
    } else {
        const sorted_formats = {
            h264: {
                video: [],
                audio: [],
                bestVideo: undefined,
                bestAudio: undefined,
            },
            vp9: {
                video: [],
                audio: [],
                bestVideo: undefined,
                bestAudio: undefined,
            },
            av1: {
                video: [],
                audio: [],
                bestVideo: undefined,
                bestAudio: undefined,
            },
        }

        // match the union of mimeType + codec against codec family aliases
        // (the adapter emits family aliases so vp9's full InnerTube name
        // "vp09.…" never hides a matchable format)
        const codecHay = entry => `${entry.mimeType} ${entry.codec ?? ""}`;

        const checkFormat = (entry, pCodec) => entry.contentLength > 0
            && entry.deliveryMethod === "PROGRESSIVE_HTTP"
            && (codecHay(entry).includes(codecList[pCodec].videoCodec)
                || codecHay(entry).includes(codecList[pCodec].audioCodec));

        const sortInto = (entries, kind) => entries
            .sort((a, b) => Number(b.bitrate) - Number(a.bitrate))
            .forEach(entry => {
                Object.keys(codecList).forEach(yCodec => {
                    const matchingItag = slot => !o.itag?.[slot] || o.itag[slot] === entry.itag;
                    const sorted = sorted_formats[yCodec];
                    if (!checkFormat(entry, yCodec)) return;

                    if (kind === "video" && matchingItag('video')) {
                        sorted.video.push(entry);
                        if (!sorted.bestVideo)
                            sorted.bestVideo = entry;
                    }

                    if (kind === "audio" && matchingItag('audio')) {
                        sorted.audio.push(entry);
                        if (!sorted.bestAudio)
                            sorted.bestAudio = entry;
                    }
                })
            });

        // old cobalt never used muxed formats, and OTF/DASH entries
        // (manifestUrl set) can't be merged either
        sortInto(result.videoOnly ?? [], "video");
        sortInto(result.audio ?? [], "audio");

        const noBestMedia = () => {
            const vid = sorted_formats[codec]?.bestVideo;
            const aud = sorted_formats[codec]?.bestAudio;
            return (!vid && !o.isAudioOnly) || (!aud && o.isAudioOnly)
        };

        if (noBestMedia()) {
            if (codec === "av1") codec = "vp9";
            else if (codec === "vp9") codec = "av1";

            // if there's no higher quality fallback, then use h264
            if (noBestMedia()) codec = "h264";
        }

        // if there's no proper combo of av1, vp9, or h264, then give up
        if (noBestMedia()) {
            return { error: "youtube.no_matching_format" };
        }

        audio = sorted_formats[codec].bestAudio;

        if (audio && !isOriginalTrack(audio)) {
            audio = sorted_formats[codec].audio.find(isOriginalTrack) || audio;
        }

        if (o.dubLang) {
            // sorted.audio is bitrate-descending, so the first match
            // is the highest bitrate dubbed track
            const dubbedAudio = sorted_formats[codec].audio.find(i =>
                ((i.audioTrackId || "").startsWith(o.dubLang)
                    || (i.audioLocale || "").startsWith(o.dubLang))
                && !isOriginalTrack(i)
            );

            if (dubbedAudio) {
                audio = dubbedAudio;
                dubbedLanguage = dubbedAudio.audioLocale || dubbedAudio.audioTrackId;
            }
        }

        if (!o.isAudioOnly) {
            const qual = (i) => {
                return normalizeQuality({
                    width: i.width,
                    height: i.height,
                })
            }

            const bestQuality = qual(sorted_formats[codec].bestVideo);
            const useBestQuality = quality >= bestQuality;

            video = useBestQuality
                ? sorted_formats[codec].bestVideo
                : sorted_formats[codec].video.find(i => qual(i) === quality);

            if (!video) video = sorted_formats[codec].bestVideo;
        }

        if (o.subtitleLang && !o.isAudioOnly && result.subtitles?.length) {
            // manual captions only
            const preferredSub = result.subtitles.find(sub =>
                !sub.auto && (sub.language || "").startsWith(o.subtitleLang)
            );

            if (preferredSub) {
                subtitles = {
                    url: preferredSub.url,
                    language: preferredSub.language,
                }
            }
        }
    }

    const fileMetadata = {
        title: (result.title || "").trim(),
        artist: (result.uploader || "").replace("- Topic", "").trim()
    }

    const description = stripTags(result.description || "");
    if (description.startsWith("Provided to YouTube by")) {
        const descItems = description.split("\n\n", 5);

        if (descItems.length === 5) {
            fileMetadata.album = descItems[2];
            fileMetadata.copyright = descItems[3];
            if (descItems[4].startsWith("Released on:")) {
                fileMetadata.date = descItems[4].replace("Released on: ", '').trim();
            }
        }
    }

    if (subtitles) {
        fileMetadata.sublanguage = subtitles.language;
    }

    const filenameAttributes = {
        service: "youtube",
        id: o.id,
        title: fileMetadata.title,
        author: fileMetadata.artist,
        youtubeDubName: dubbedLanguage || false,
    }

    const itag = {
        video: video?.itag,
        audio: audio?.itag
    };

    const originalRequest = {
        ...o,
        dispatcher: undefined,
        itag,
    };

    if (audio && o.isAudioOnly) {
        let bestAudio = codec === "h264" ? "m4a" : "opus";
        let urls = audio.url;

        if (useHLS) {
            bestAudio = "mp3";
            urls = audio.uri;
        }

        let cover = `https://i.ytimg.com/vi/${o.id}/maxresdefault.jpg`;
        const testMaxCover = await fetch(cover, { dispatcher: o.dispatcher })
            .then(r => r.status === 200)
            .catch(() => {});

        if (!testMaxCover) {
            cover = result.thumbnail;
        }

        return {
            type: "audio",
            isAudioOnly: true,
            urls,
            filenameAttributes,
            fileMetadata,
            bestAudio,
            isHLS: useHLS,
            originalRequest,

            cover,
            cropCover: (result.uploader || "").endsWith("- Topic"),
        }
    }

    if (video && audio) {
        let resolution;

        if (useHLS) {
            resolution = normalizeQuality(video.resolution);
            filenameAttributes.resolution = `${video.resolution.width}x${video.resolution.height}`;
            filenameAttributes.extension = o.container === "auto" ? hlsCodecList[codec].container : o.container;

            video = video.uri;
            audio = audio.uri;
        } else {
            resolution = normalizeQuality({
                width: video.width,
                height: video.height,
            });

            filenameAttributes.resolution = `${video.width}x${video.height}`;
            filenameAttributes.extension = o.container === "auto" ? codecList[codec].container : o.container;

            video = video.url;
            audio = audio.url;
        }

        filenameAttributes.qualityLabel = `${resolution}p`;
        filenameAttributes.youtubeFormat = codec;

        return {
            type: "merge",
            urls: [
                video,
                audio,
            ],
            subtitles: subtitles?.url,
            filenameAttributes,
            fileMetadata,
            isHLS: useHLS,
            originalRequest
        }
    }

    return { error: "youtube.no_matching_format" };
}
