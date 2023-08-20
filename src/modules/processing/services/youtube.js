import { Innertube } from 'youtubei.js';
import { maxVideoDuration } from '../../config.js';
import { cleanString } from '../../sub/utils.js';

const yt = await Innertube.create();

const c = {
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

export default async function(o) {
    let info, isDubbed, quality = o.quality === "max" ? "9000" : o.quality; //set quality 9000(p) to be interpreted as max
    function qual(i) {
        return i['quality_label'].split('p')[0].split('s')[0]
    }

    try {
        info = await yt.getBasicInfo(o.id, 'ANDROID');
    } catch (e) {
        return { error: 'ErrorCantConnectToServiceAPI' };
    }

    if (!info) return { error: 'ErrorCantConnectToServiceAPI' };

    if (info.playability_status.status !== 'OK') return { error: 'ErrorYTUnavailable' };
    if (info.basic_info.is_live) return { error: 'ErrorLiveVideo' };

    let bestQuality, hasAudio, adaptive_formats = info.streaming_data.adaptive_formats.filter((e) => {
        if (e["mime_type"].includes(c[o.format].codec) || e["mime_type"].includes(c[o.format].aCodec)) return true
    }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    bestQuality = adaptive_formats.find(i => i["has_video"]);
    hasAudio = adaptive_formats.find(i => i["has_audio"]);

    if (bestQuality) bestQuality = qual(bestQuality);
    if (!bestQuality && !o.isAudioOnly || !hasAudio) return { error: 'ErrorYTTryOtherCodec' };
    if (info.basic_info.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let checkBestAudio = (i) => (i["has_audio"] && !i["has_video"]),
        audio = adaptive_formats.find(i => checkBestAudio(i) && !i["is_dubbed"]);

    if (o.dubLang) {
        let dubbedAudio = adaptive_formats.find(i => checkBestAudio(i) && i["language"] === o.dubLang);
        if (dubbedAudio) {
            audio = dubbedAudio;
            isDubbed = true
        }
    }

    let fileMetadata = {
        title: cleanString(info.basic_info.title.replace(/\p{Emoji}/gu, '').trim()),
        artist: cleanString(info.basic_info.author.replace("- Topic", "").replace(/\p{Emoji}/gu, '').trim()),
    }
    if (info.basic_info.short_description && info.basic_info.short_description.startsWith("Provided to YouTube by")) {
        let descItems = info.basic_info.short_description.split("\n\n");
        fileMetadata.album = descItems[2];
        fileMetadata.copyright = descItems[3];
        if (descItems[4].startsWith("Released on:")) {
            fileMetadata.date = descItems[4].replace("Released on: ", '').trim()
        }
    };

    if (hasAudio && o.isAudioOnly) return {
        type: "render",
        isAudioOnly: true,
        urls: audio.url,
        audioFilename: `youtube_${o.id}_audio${isDubbed ? `_${o.dubLang}`:''}`,
        fileMetadata: fileMetadata
    }
    let checkSingle = (i) => ((qual(i) === quality || qual(i) === bestQuality) && i["mime_type"].includes(c[o.format].codec)),
        checkBestVideo = (i) => (i["has_video"] && !i["has_audio"] && qual(i) === bestQuality),
        checkRightVideo = (i) => (i["has_video"] && !i["has_audio"] && qual(i) === quality);

    if (!o.isAudioOnly && !o.isAudioMuted && o.format === 'h264') {
        let single = info.streaming_data.formats.find(i => checkSingle(i));
        if (single) return {
            type: "bridge",
            urls: single.url,
            filename: `youtube_${o.id}_${single.width}x${single.height}_${o.format}.${c[o.format].container}`,
            fileMetadata: fileMetadata
        }
    };

    let video = adaptive_formats.find(i => ((Number(quality) > Number(bestQuality)) ? checkBestVideo(i) : checkRightVideo(i)));
    if (video && audio) return {
        type: "render",
        urls: [video.url, audio.url],
        filename: `youtube_${o.id}_${video.width}x${video.height}_${o.format}${isDubbed ? `_${o.dubLang}`:''}.${c[o.format].container}`,
        fileMetadata: fileMetadata
    };

    return { error: 'ErrorYTTryOtherCodec' }
}
