import HLS from "hls-parser";

import { fetch } from "undici";
import { Innertube, Session } from "@imput/youtubei.js";

import { env } from "../../config.js";
import { getCookie } from "../cookie/manager.js";
import { getYouTubeSession } from "../helpers/youtube-session.js";

const PLAYER_REFRESH_PERIOD = 1000 * 60 * 15; // ms

let innertube, lastRefreshedAt;

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
        container: "webm"
    }
}

const clientsWithNoCipher = ['IOS', 'ANDROID', 'YTSTUDIO_ANDROID', 'YTMUSIC_ANDROID'];

const videoQualities = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];

const cloneInnertube = async (customFetch, useSession) => {
    const shouldRefreshPlayer = lastRefreshedAt + PLAYER_REFRESH_PERIOD < new Date();

    const rawCookie = getCookie('youtube');
    const cookie = rawCookie?.toString();

    const sessionTokens = getYouTubeSession();
    const retrieve_player = Boolean(sessionTokens || cookie);

    if (useSession && env.ytSessionServer && !sessionTokens?.potoken) {
        throw "no_session_tokens";
    }

    if (!innertube || shouldRefreshPlayer) {
        innertube = await Innertube.create({
            fetch: customFetch,
            retrieve_player,
            cookie,
            po_token: useSession ? sessionTokens?.potoken : undefined,
            visitor_data: useSession ? sessionTokens?.visitor_data : undefined,
        });
        lastRefreshedAt = +new Date();
    }

    const session = new Session(
        innertube.session.context,
        innertube.session.api_key,
        innertube.session.api_version,
        innertube.session.account_index,
        innertube.session.config_data,
        innertube.session.player,
        cookie,
        customFetch ?? innertube.session.http.fetch,
        innertube.session.cache,
        sessionTokens?.potoken
    );

    const yt = new Innertube(session);
    return yt;
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

const getSubtitles = async (info, dispatcher, subtitleLang) => {
    const preferredCap = info.captions.caption_tracks.find(caption =>
        caption.kind !== 'asr' && caption.language_code.startsWith(subtitleLang)
    );

    const captionsUrl = preferredCap?.base_url;
    if (!captionsUrl) return;

    if (!captionsUrl.includes("exp=xpe")) {
        let url = new URL(captionsUrl);
        url.searchParams.set('fmt', 'vtt');

        return {
            url: url.toString(),
            language: preferredCap.language_code,
        }
    }

    // if we have exp=xpe in the url, then captions are
    // locked down and can't be accessed without a yummy potoken,
    // so instead we just use subtitles from HLS

    const hlsVariants = await getHlsVariants(
        info.streaming_data.hls_manifest_url,
        dispatcher
    );
    if (hlsVariants?.error) return;

    // all variants usually have the same set of subtitles
    const hlsSubtitles = hlsVariants[0]?.subtitles;
    if (!hlsSubtitles?.length) return;

    const preferredHls = hlsSubtitles.find(
        subtitle => subtitle.language.startsWith(subtitleLang)
    );

    if (!preferredHls) return;

    const fetchedHlsSubs =
        await fetch(preferredHls.uri, { dispatcher })
            .then(r => r.status === 200 ? r.text() : undefined)
            .catch(() => {});

    const parsedSubs = HLS.parse(fetchedHlsSubs);
    if (!parsedSubs) return;

    return {
        url: parsedSubs.segments[0]?.uri,
        language: preferredHls.language,
    }
}

export default async function (o) {
    const quality = o.quality === "max" ? 9000 : Number(o.quality);

    let useHLS = o.youtubeHLS;
    let innertubeClient = o.innertubeClient || env.customInnertubeClient || "IOS";

    // HLS playlists from the iOS client don't contain the av1 video format.
    if (useHLS && o.codec === "av1") {
        useHLS = false;
    }

    if (useHLS) {
        innertubeClient = "IOS";
    }

    // iOS client doesn't have adaptive formats of resolution >1080p,
    // so we use the WEB_EMBEDDED client instead for those cases
    let useSession =
        env.ytSessionServer && (
            (
                !useHLS
                && innertubeClient === "IOS"
                && (
                    (quality > 1080 && o.codec !== "h264")
                    || (quality > 1080 && o.codec !== "vp9")
                )
            )
        );

    // we can get subtitles reliably only from the iOS client
    if (o.subtitleLang) {
        innertubeClient = "IOS";
        useSession = false;
    }

    if (useSession) {
        innertubeClient = env.ytSessionInnertubeClient || "WEB_EMBEDDED";
    }

    let yt;
    try {
        yt = await cloneInnertube(
            (input, init) => fetch(input, {
                ...init,
                dispatcher: o.dispatcher
            }),
            useSession
        );
    } catch (e) {
        if (e === "no_session_tokens") {
            return { error: "youtube.no_session_tokens" };
        } else if (e.message?.endsWith("decipher algorithm")) {
            return { error: "youtube.decipher" }
        } else if (e.message?.includes("refresh access token")) {
            return { error: "youtube.token_expired" }
        } else throw e;
    }

    let info;
    try {
        info = await yt.getBasicInfo(o.id, innertubeClient);
    } catch (e) {
        if (e?.info) {
            let errorInfo;
            try { errorInfo = JSON.parse(e?.info); } catch {}

            if (errorInfo?.reason === "This video is private") {
                return { error: "content.video.private" };
            }
            if (["INVALID_ARGUMENT", "UNAUTHENTICATED"].includes(errorInfo?.error?.status)) {
                return { error: "youtube.api_error" };
            }
        }

        if (e?.message === "This video is unavailable") {
            return { error: "content.video.unavailable" };
        }

        return { error: "fetch.fail" };
    }

    if (!info) return { error: "fetch.fail" };

    const playability = info.playability_status;
    const basicInfo = info.basic_info;

    switch (playability.status) {
        case "LOGIN_REQUIRED":
            if (playability.reason.endsWith("bot")) {
                return { error: "youtube.login" }
            }
            if (playability.reason.endsWith("age") || playability.reason.endsWith("inappropriate for some users.")) {
                return { error: "content.video.age" }
            }
            if (playability?.error_screen?.reason?.text === "Private video") {
                return { error: "content.video.private" }
            }
            break;

        case "UNPLAYABLE":
            if (playability?.reason?.endsWith("request limit.")) {
                return { error: "fetch.rate" }
            }
            if (playability?.error_screen?.subreason?.text?.endsWith("in your country")) {
                return { error: "content.video.region" }
            }
            if (playability?.error_screen?.reason?.text === "Private video") {
                return { error: "content.video.private" }
            }
            break;

        case "AGE_VERIFICATION_REQUIRED":
            return { error: "content.video.age" };
    }

    if (playability.status !== "OK") {
        return { error: "content.video.unavailable" };
    }

    if (basicInfo.is_live) {
        return { error: "content.video.live" };
    }

    if (basicInfo.duration > env.durationLimit) {
        return { error: "content.too_long" };
    }

    // return a critical error if returned video is "Video Not Available"
    // or a similar stub by youtube
    if (basicInfo.id !== o.id) {
        return {
            error: "fetch.fail",
            critical: true
        }
    }

    const normalizeQuality = res => {
        const shortestSide = Math.min(res.height, res.width);
        return videoQualities.find(qual => qual >= shortestSide);
    }

    let video, audio, subtitles, dubbedLanguage,
        codec = o.codec || "h264", itag = o.itag;

    if (useHLS) {
        const variants = await getHlsVariants(
            info.streaming_data.hls_manifest_url,
            o.dispatcher
        );

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
        // i miss typescript so bad
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

        const checkFormat = (format, pCodec) => format.content_length &&
            (format.mime_type.includes(codecList[pCodec].videoCodec)
                || format.mime_type.includes(codecList[pCodec].audioCodec));

        // sort formats & weed out bad ones
        info.streaming_data.adaptive_formats.sort((a, b) =>
            Number(b.bitrate) - Number(a.bitrate)
        ).forEach(format => {
            Object.keys(codecList).forEach(yCodec => {
                const matchingItag = slot => !itag?.[slot] || itag[slot] === format.itag;
                const sorted = sorted_formats[yCodec];
                const goodFormat = checkFormat(format, yCodec);
                if (!goodFormat) return;

                if (format.has_video && matchingItag('video')) {
                    sorted.video.push(format);
                    if (!sorted.bestVideo)
                        sorted.bestVideo = format;
                }

                if (format.has_audio && matchingItag('audio')) {
                    sorted.audio.push(format);
                    if (!sorted.bestAudio)
                        sorted.bestAudio = format;
                }
            })
        });

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

        if (audio?.audio_track && !audio?.is_original) {
            audio = sorted_formats[codec].audio.find(i =>
                i?.is_original
            );
        }

        if (o.dubLang) {
            const dubbedAudio = sorted_formats[codec].audio.find(i =>
                i.language?.startsWith(o.dubLang) && i.audio_track
            );

            if (dubbedAudio && !dubbedAudio?.is_original) {
                audio = dubbedAudio;
                dubbedLanguage = dubbedAudio.language;
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

        if (o.subtitleLang && !o.isAudioOnly && info.captions?.caption_tracks?.length) {
            const videoSubtitles = await getSubtitles(info, o.dispatcher, o.subtitleLang);
            if (videoSubtitles) {
                subtitles = videoSubtitles;
            }
        }
    }

    if (video?.drm_families || audio?.drm_families) {
        return { error: "youtube.drm" };
    }

    const fileMetadata = {
        title: basicInfo.title.trim(),
        artist: basicInfo.author.replace("- Topic", "").trim()
    }

    if (basicInfo?.short_description?.startsWith("Provided to YouTube by")) {
        const descItems = basicInfo.short_description.split("\n\n", 5);

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

    itag = {
        video: video?.itag,
        audio: audio?.itag
    };

    const originalRequest = {
        ...o,
        dispatcher: undefined,
        itag,
        innertubeClient
    };

    if (audio && o.isAudioOnly) {
        let bestAudio = codec === "h264" ? "m4a" : "opus";
        let urls = audio.url;

        if (useHLS) {
            bestAudio = "mp3";
            urls = audio.uri;
        }

        if (!clientsWithNoCipher.includes(innertubeClient) && innertube) {
            urls = audio.decipher(innertube.session.player);
        }

        let cover = `https://i.ytimg.com/vi/${o.id}/maxresdefault.jpg`;
        const testMaxCover = await fetch(cover, { dispatcher: o.dispatcher })
            .then(r => r.status === 200)
            .catch(() => {});

        if (!testMaxCover) {
            cover = basicInfo.thumbnail?.[0]?.url;
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
            cropCover: basicInfo.author.endsWith("- Topic"),
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

            if (!clientsWithNoCipher.includes(innertubeClient) && innertube) {
                video = video.decipher(innertube.session.player);
                audio = audio.decipher(innertube.session.player);
            } else {
                video = video.url;
                audio = audio.url;
            }
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
