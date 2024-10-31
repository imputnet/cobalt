import HLS from "hls-parser";

import { fetch } from "undici";
import { Innertube, Session } from "youtubei.js";

import { env } from "../../config.js";
import { cleanString } from "../../misc/utils.js";
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
    } catch(e) {
        if (e.message?.endsWith("decipher algorithm")) {
            return { error: "youtube.decipher" }
        } else if (e.message?.includes("refresh access token")) {
            return { error: "youtube.token_expired" }
        } else throw e;
    }

    let info;
    try {
        info = await yt.getBasicInfo(o.id, o.youtubeHLS ? 'IOS' : 'ANDROID');
    } catch(e) {
        if (e?.info?.reason === "This video is private") {
            return { error: "content.video.private" };
        } else if (e?.message === "This video is unavailable") {
            return { error: "content.video.unavailable" };
        } else {
            return { error: "fetch.fail" };
        }
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

    const matchQuality = res => {
        const qual = res.height > res.width ? res.width : res.height;
        return Math.ceil(qual / 24) * 24;
    }

    let video, audio, dubbedLanguage,
        format = o.format || "h264";

    if (o.youtubeHLS) {
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

        // HLS playlists don't contain AV1 format, at least with the iOS client
        if (format === "av1") {
            format = "vp9";
        }

        const matchHlsCodec = codecs => (
            codecs.includes(hlsCodecList[format].videoCodec)
        );

        const best = variants.find(i => matchHlsCodec(i.codecs));

        const preferred = variants.find(i =>
            matchHlsCodec(i.codecs) && matchQuality(i.resolution) === quality
        );

        let selected = preferred || best;

        if (!selected) {
            format = "h264";
            selected = variants.find(i => matchHlsCodec(i.codecs));
        }

        if (!selected) {
            return { error: "youtube.no_hls_streams" };
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
        let fallback = false;

        const filterByCodec = (formats) =>
            formats.filter(e =>
                e.mime_type.includes(codecList[format].videoCodec)
                || e.mime_type.includes(codecList[format].audioCodec)
            ).sort((a, b) =>
                Number(b.bitrate) - Number(a.bitrate)
            );

        let adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats);

        const checkBestVideo = (i) => (i.has_video && i.content_length);
        const checkBestAudio = (i) => (i.has_audio && i.content_length);
        const checkNoMedia = (vid, aud) => (!vid && !o.isAudioOnly) || (!aud && o.isAudioOnly);

        const earlyBestVideo = adaptive_formats.find(i => checkBestVideo(i));
        const earlyBestAudio = adaptive_formats.find(i => checkBestAudio(i));

        // check if formats have all needed media and fall back to h264 if not
        if (["vp9", "av1"].includes(format) && checkNoMedia(earlyBestVideo, earlyBestAudio)) {
            fallback = true;
            format = "h264";
            adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats);
        }

        const bestVideo = !fallback ? earlyBestVideo : adaptive_formats.find(i => checkBestVideo(i));
        const bestAudio = !fallback ? earlyBestAudio : adaptive_formats.find(i => checkBestAudio(i));

        if (checkNoMedia(bestVideo, bestAudio)) {
            return { error: "youtube.codec" };
        }

        audio = bestAudio;

        if (audio?.audio_track && !audio?.audio_track?.audio_is_default) {
            audio = adaptive_formats.find(i =>
                checkBestAudio(i) && i?.audio_track?.audio_is_default
            );
        }

        if (o.dubLang) {
            const dubbedAudio = adaptive_formats.find(i =>
                checkBestAudio(i) && i.language?.startsWith(o.dubLang) && i.audio_track
            )

            if (dubbedAudio && !dubbedAudio?.audio_track?.audio_is_default) {
                audio = dubbedAudio;
                dubbedLanguage = dubbedAudio.language;
            }
        }

        if (!o.isAudioOnly) {
            const qual = (i) => {
                return matchQuality({
                    width: i.width,
                    height: i.height,
                })
            }

            const bestQuality = qual(bestVideo);
            const useBestQuality = quality >= bestQuality;

            video = useBestQuality ? bestVideo : adaptive_formats.find(i =>
                qual(i) === quality && checkBestVideo(i)
            );

            if (!video) video = bestVideo;
        }
    }

    const fileMetadata = {
        title: cleanString(basicInfo.title.trim()),
        artist: cleanString(basicInfo.author.replace("- Topic", "").trim())
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
        let bestAudio = format === "h264" ? "m4a" : "opus";
        let urls = audio.url;

        if (o.youtubeHLS) {
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
            isHLS: o.youtubeHLS,
        }
    }

    if (video && audio) {
        let resolution;

        if (o.youtubeHLS) {
            resolution = matchQuality(video.resolution);
            filenameAttributes.resolution = `${video.resolution.width}x${video.resolution.height}`;
            filenameAttributes.extension = hlsCodecList[format].container;

            video = video.uri;
            audio = audio.uri;
        } else {
            resolution = matchQuality({
                width: video.width,
                height: video.height,
            });
            filenameAttributes.resolution = `${video.width}x${video.height}`;
            filenameAttributes.extension = codecList[format].container;

            video = video.url;
            audio = audio.url;
        }

        filenameAttributes.qualityLabel = `${resolution}p`;
        filenameAttributes.youtubeFormat = format;

        return {
            type: "merge",
            urls: [
                video,
                audio,
            ],
            filenameAttributes,
            fileMetadata,
            isHLS: o.youtubeHLS,
        }
    }

    return { error: "fetch.fail" };
}
