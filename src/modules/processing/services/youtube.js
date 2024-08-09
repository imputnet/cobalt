import { fetch } from "undici";

import { Innertube, Session } from "youtubei.js";

import { env } from "../../config.js";
import { cleanString } from "../../sub/utils.js";
import { getCookie, updateCookieValues } from "../cookie/manager.js";

const PLAYER_REFRESH_PERIOD = 1000 * 60 * 15; // ms

let innertube, lastRefreshedAt;

const codecMatch = {
    h264: {
        videoCodec: "avc1",
        audioCodec: "mp4a",
        container: "mp4"
    },
    av1: {
        videoCodec: "av01",
        audioCodec: "mp4a",
        container: "mp4"
    },
    vp9: {
        videoCodec: "vp9",
        audioCodec: "opus",
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
                return { error: "ErrorYoutubeDecipher" }
        } else throw e;
    }

    const quality = o.quality === "max" ? "9000" : o.quality;

    let info, isDubbed,
        format = o.format || "h264";

    function qual(i) {
        if (!i.quality_label) {
            return;
        }

        return i.quality_label.split('p')[0].split('s')[0]
    }

    try {
        info = await yt.getBasicInfo(o.id, yt.session.logged_in ? 'ANDROID' : 'IOS');
    } catch(e) {
        if (e?.message === 'This video is unavailable') {
            return { error: 'ErrorCouldntFetch' };
        } else {
            return { error: 'ErrorCantConnectToServiceAPI' };
        }
    }

    if (!info) return { error: 'ErrorCantConnectToServiceAPI' };

    const playability = info.playability_status;
    const basicInfo = info.basic_info;

    if (playability.status === 'LOGIN_REQUIRED') {
        if (playability.reason.endsWith('bot')) {
            return { error: 'ErrorYTLogin' }
        }
        if (playability.reason.endsWith('age')) {
            return { error: 'ErrorYTAgeRestrict' }
        }
    }
    if (playability.status === "UNPLAYABLE" && playability.reason.endsWith('request limit.')) {
        return { error: 'ErrorYTRateLimit' }
    }

    if (playability.status !== 'OK') return { error: 'ErrorYTUnavailable' };
    if (basicInfo.is_live) return { error: 'ErrorLiveVideo' };

    // return a critical error if returned video is "Video Not Available"
    // or a similar stub by youtube
    if (basicInfo.id !== o.id) {
        return {
            error: 'ErrorCantConnectToServiceAPI',
            critical: true
        }
    }

    let bestQuality, hasAudio;

    const filterByCodec = (formats) =>
        formats
        .filter(e =>
            e.mime_type.includes(codecMatch[format].videoCodec)
            || e.mime_type.includes(codecMatch[format].audioCodec)
        )
        .sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    let adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats);

    if (adaptive_formats.length === 0 && format === "vp9") {
        format = "h264"
        adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats)
    }

    bestQuality = adaptive_formats.find(i => i.has_video && i.content_length);
    hasAudio = adaptive_formats.find(i => i.has_audio && i.content_length);

    if (bestQuality) bestQuality = qual(bestQuality);

    if ((!bestQuality && !o.isAudioOnly) || !hasAudio)
        return { error: 'ErrorYTTryOtherCodec' };

    if (basicInfo.duration > env.durationLimit)
        return { error: ['ErrorLengthLimit', env.durationLimit / 60] };

    const checkBestAudio = (i) => (i.has_audio && !i.has_video);

    let audio = adaptive_formats.find(i =>
        checkBestAudio(i) && i.is_original
    );

    if (o.dubLang) {
        let dubbedAudio = adaptive_formats.find(i =>
            checkBestAudio(i)
            && i.language === o.dubLang
            && i.audio_track
        )

        if (dubbedAudio) {
            audio = dubbedAudio;
            isDubbed = true;
        }
    }

    if (!audio) {
        audio = adaptive_formats.find(i => checkBestAudio(i));
    }

    let fileMetadata = {
        title: cleanString(basicInfo.title.trim()),
        artist: cleanString(basicInfo.author.replace("- Topic", "").trim()),
    }

    if (basicInfo?.short_description?.startsWith("Provided to YouTube by")) {
        let descItems = basicInfo.short_description.split("\n\n");
        fileMetadata.album = descItems[2];
        fileMetadata.copyright = descItems[3];
        if (descItems[4].startsWith("Released on:")) {
            fileMetadata.date = descItems[4].replace("Released on: ", '').trim()
        }
    }

    let filenameAttributes = {
        service: "youtube",
        id: o.id,
        title: fileMetadata.title,
        author: fileMetadata.artist,
        youtubeDubName: isDubbed ? o.dubLang : false
    }

    if (audio && o.isAudioOnly) return {
        type: "render",
        isAudioOnly: true,
        urls: audio.decipher(yt.session.player),
        filenameAttributes: filenameAttributes,
        fileMetadata: fileMetadata,
        bestAudio: format === "h264" ? "m4a" : "opus"
    }

    const matchingQuality = Number(quality) > Number(bestQuality) ? bestQuality : quality,
        checkSingle = i =>
            qual(i) === matchingQuality && i.mime_type.includes(codecMatch[format].videoCodec),
        checkRender = i =>
            qual(i) === matchingQuality && i.has_video && !i.has_audio;

    let match, type, urls;

    if (!o.isAudioOnly && !o.isAudioMuted && format === 'h264') {
        match = info.streaming_data.formats.find(checkSingle);
        type = "bridge";
        urls = match?.decipher(yt.session.player);
    }

    const video = adaptive_formats.find(checkRender);

    if (!match && video && audio) {
        match = video;
        type = "render";
        urls = [
            video.decipher(yt.session.player),
            audio.decipher(yt.session.player)
        ]
    }

    if (match) {
        filenameAttributes.qualityLabel = match.quality_label;
        filenameAttributes.resolution = `${match.width}x${match.height}`;
        filenameAttributes.extension = codecMatch[format].container;
        filenameAttributes.youtubeFormat = format;
        return {
            type,
            urls,
            filenameAttributes,
            fileMetadata
        }
    }

    return { error: 'ErrorYTTryOtherCodec' }
}
