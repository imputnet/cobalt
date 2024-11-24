import HLS from "hls-parser";

import { fetch } from "undici";
import { Innertube, Session } from "youtubei.js";

import { env } from "../../config.js";
import { getCookie, updateCookieValues } from "../cookie/manager.js";

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

const videoQualities = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];

const transformSessionData = (cookie) => {
    if (!cookie)
        return;

    const values = { ...cookie.values() };
    const REQUIRED_VALUES = [ 'access_token', 'refresh_token' ];

    if (REQUIRED_VALUES.some(x => typeof values[x] !== 'string')) {
        return;
    }

    if (values.expires) {
        values.expiry_date = values.expires;
        delete values.expires;
    } else if (!values.expiry_date) {
        return;
    }

    return values;
}

const cloneInnertube = async (customFetch) => {
    const shouldRefreshPlayer = lastRefreshedAt + PLAYER_REFRESH_PERIOD < new Date();
    if (!innertube || shouldRefreshPlayer) {
        innertube = await Innertube.create({
            fetch: customFetch
        });
        lastRefreshedAt = +new Date();
    }

    const session = new Session(
        innertube.session.context,
        innertube.session.key,
        innertube.session.api_version,
        innertube.session.account_index,
        innertube.session.player,
        undefined,
        customFetch ?? innertube.session.http.fetch,
        innertube.session.cache
    );

    const cookie = getCookie('youtube_oauth');
    const oauthData = transformSessionData(cookie);

    if (!session.logged_in && oauthData) {
        await session.oauth.init(oauthData);
        session.logged_in = true;
    }

    if (session.logged_in) {
        if (session.oauth.shouldRefreshToken()) {
            await session.oauth.refreshAccessToken();
        }

        const cookieValues = cookie.values();
        const oldExpiry = new Date(cookieValues.expiry_date);
        const newExpiry = new Date(session.oauth.oauth2_tokens.expiry_date);

        if (oldExpiry.getTime() !== newExpiry.getTime()) {
            updateCookieValues(cookie, {
                ...session.oauth.client_id,
                ...session.oauth.oauth2_tokens,
                expiry_date: newExpiry.toISOString()
            });
        }
    }

    const yt = new Innertube(session);
    return yt;
}

export default async function(o) {
    let yt;
    try {
        yt = await cloneInnertube(
            (input, init) => fetch(input, {
                ...init,
                dispatcher: o.dispatcher
            })
        );
    } catch (e) {
        if (e.message?.endsWith("decipher algorithm")) {
            return { error: "youtube.decipher" }
        } else if (e.message?.includes("refresh access token")) {
            return { error: "youtube.token_expired" }
        } else throw e;
    }

    let useHLS = o.youtubeHLS;

    // HLS playlists don't contain the av1 video format, at least with the iOS client
    if (useHLS && o.format === "av1") {
        useHLS = false;
    }

    let info;
    try {
        info = await yt.getBasicInfo(o.id, useHLS ? 'IOS' : 'ANDROID');
    } catch (e) {
        if (e?.info) {
            const errorInfo = JSON.parse(e?.info);

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

    switch(playability.status) {
        case "LOGIN_REQUIRED":
            if (playability.reason.endsWith("bot")) {
                return { error: "youtube.login" }
            }
            if (playability.reason.endsWith("age")) {
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

    const quality = o.quality === "max" ? 9000 : Number(o.quality);

    const normalizeQuality = res => {
        const shortestSide = res.height > res.width ? res.width : res.height;
        return videoQualities.find(qual => qual >= shortestSide);
    }

    let video, audio, dubbedLanguage,
        codec = o.format || "h264";

    if (useHLS) {
        const hlsManifest = info.streaming_data.hls_manifest_url;

        if (!hlsManifest) {
            return { error: "youtube.no_hls_streams" };
        }

        const fetchedHlsManifest = await fetch(hlsManifest, {
            dispatcher: o.dispatcher,
        }).then(r => {
            if (r.status === 200) {
                return r.text();
            } else {
                throw new Error("couldn't fetch the HLS playlist");
            }
        }).catch(() => {});

        if (!fetchedHlsManifest) {
            return { error: "youtube.no_hls_streams" };
        }

        const variants = HLS.parse(fetchedHlsManifest).variants.sort(
            (a, b) => Number(b.bandwidth) - Number(a.bandwidth)
        );

        if (!variants || variants.length === 0) {
            return { error: "youtube.no_hls_streams" };
        }

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
            audio = selected.audio.find(i => i.name.endsWith("- original"));
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
                const sorted = sorted_formats[yCodec];
                const goodFormat = checkFormat(format, yCodec);
                if (!goodFormat) return;

                if (format.has_video) {
                    sorted.video.push(format);
                    if (!sorted.bestVideo) sorted.bestVideo = format;
                }
                if (format.has_audio) {
                    sorted.audio.push(format);
                    if (!sorted.bestAudio) sorted.bestAudio = format;
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

        if (audio?.audio_track && !audio?.audio_track?.audio_is_default) {
            audio = sorted_formats[codec].audio.find(i =>
                i?.audio_track?.audio_is_default
            );
        }

        if (o.dubLang) {
            const dubbedAudio = sorted_formats[codec].audio.find(i =>
                i.language?.startsWith(o.dubLang) && i.audio_track
            );

            if (dubbedAudio && !dubbedAudio?.audio_track?.audio_is_default) {
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

    const filenameAttributes = {
        service: "youtube",
        id: o.id,
        title: fileMetadata.title,
        author: fileMetadata.artist,
        youtubeDubName: dubbedLanguage || false,
    }

    if (audio && o.isAudioOnly) {
        let bestAudio = codec === "h264" ? "m4a" : "opus";
        let urls = audio.url;

        if (useHLS) {
            bestAudio = "mp3";
            urls = audio.uri;
        }

        return {
            type: "audio",
            isAudioOnly: true,
            urls,
            filenameAttributes,
            fileMetadata,
            bestAudio,
            isHLS: useHLS,
        }
    }

    if (video && audio) {
        let resolution;

        if (useHLS) {
            resolution = normalizeQuality(video.resolution);
            filenameAttributes.resolution = `${video.resolution.width}x${video.resolution.height}`;
            filenameAttributes.extension = hlsCodecList[codec].container;

            video = video.uri;
            audio = audio.uri;
        } else {
            resolution = normalizeQuality({
                width: video.width,
                height: video.height,
            });
            filenameAttributes.resolution = `${video.width}x${video.height}`;
            filenameAttributes.extension = codecList[codec].container;

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
            filenameAttributes,
            fileMetadata,
            isHLS: useHLS,
        }
    }

    return { error: "youtube.no_matching_format" };
}
