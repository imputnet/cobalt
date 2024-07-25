import { Innertube, Session } from 'youtubei.js';
import { env } from '../../config.js';
import { cleanString } from '../../sub/utils.js';
import { fetch } from 'undici'
import { getCookie, updateCookieValues } from '../cookie/manager.js'

const ytBase = Innertube.create().catch(e => e);

const codecMatch = {
    h264: {
        codec: "avc1",
        aCodec: "mp4a",
        container: "mp4"
    },
    av1: {
        codec: "av01",
        aCodec: "mp4a",
        container: "mp4"
    },
    vp9: {
        codec: "vp9",
        aCodec: "opus",
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
    const innertube = await ytBase;
    if (innertube instanceof Error) {
        throw innertube;
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
    const yt = await cloneInnertube(
        (input, init) => fetch(input, { ...init, dispatcher: o.dispatcher })
    );

    let info, isDubbed, format = o.format || "h264";
    let quality = o.quality === "max" ? "9000" : o.quality; // 9000(p) - max quality

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
    if (info.basic_info.is_live) return { error: 'ErrorLiveVideo' };

    // return a critical error if returned video is "Video Not Available"
    // or a similar stub by youtube
    if (info.basic_info.id !== o.id) {
        return {
            error: 'ErrorCantConnectToServiceAPI',
            critical: true
        }
    }

    let bestQuality, hasAudio;

    const filterByCodec = (formats) => formats.filter(e => 
        e.mime_type.includes(codecMatch[format].codec) || e.mime_type.includes(codecMatch[format].aCodec)
    ).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    let adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats);
    if (adaptive_formats.length === 0 && format === "vp9") {
        format = "h264"
        adaptive_formats = filterByCodec(info.streaming_data.adaptive_formats)
    }

    bestQuality = adaptive_formats.find(i => i.has_video && i.content_length);
    hasAudio = adaptive_formats.find(i => i.has_audio && i.content_length);

    if (bestQuality) bestQuality = qual(bestQuality);
    if (!bestQuality && !o.isAudioOnly || !hasAudio) return { error: 'ErrorYTTryOtherCodec' };
    if (info.basic_info.duration > env.durationLimit) return { error: ['ErrorLengthLimit', env.durationLimit / 60] };

    let checkBestAudio = (i) => (i.has_audio && !i.has_video),
        audio = adaptive_formats.find(i => checkBestAudio(i) && !i.is_dubbed);

    if (o.dubLang) {
        let dubbedAudio = adaptive_formats.find(i =>
            checkBestAudio(i) && i.language === o.dubLang && i.audio_track && !i.audio_track.audio_is_default
        );
        if (dubbedAudio) {
            audio = dubbedAudio;
            isDubbed = true
        }
    }
    let fileMetadata = {
        title: cleanString(info.basic_info.title.trim()),
        artist: cleanString(info.basic_info.author.replace("- Topic", "").trim()),
    }
    if (info.basic_info.short_description && info.basic_info.short_description.startsWith("Provided to YouTube by")) {
        let descItems = info.basic_info.short_description.split("\n\n");
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

    if (hasAudio && o.isAudioOnly) return {
        type: "render",
        isAudioOnly: true,
        urls: audio.decipher(yt.session.player),
        filenameAttributes: filenameAttributes,
        fileMetadata: fileMetadata,
        bestAudio: format === "h264" ? 'm4a' : 'opus'
    }
    const matchingQuality = Number(quality) > Number(bestQuality) ? bestQuality : quality,
        checkSingle = i => qual(i) === matchingQuality && i.mime_type.includes(codecMatch[format].codec),
        checkRender = i => qual(i) === matchingQuality && i.has_video && !i.has_audio;

    let match, type, urls;
    if (!o.isAudioOnly && !o.isAudioMuted && format === 'h264') {
        match = info.streaming_data.formats.find(checkSingle);
        type = "bridge";
        urls = match?.decipher(yt.session.player);
    }

    const video = adaptive_formats.find(checkRender);
    if (!match && video) {
        match = video;
        type = "render";
        urls = [video.decipher(yt.session.player), audio.decipher(yt.session.player)];
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
