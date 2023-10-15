import { maxVideoDuration } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

const resolutionMatch = {
    "3840": "2160",
    "2732": "1440",
    "2048": "1080",
    "1920": "1080",
    "1366": "720",
    "1280": "720",
    "960": "480",
    "640": "360",
    "426": "240"
}

const qualityMatch = {
    "2160": "4K",
    "1440": "2K",
    "480": "540",

    "4K": "2160",
    "2K": "1440",
    "540": "480"
}

export default async function(obj) {
    let quality = obj.quality === "max" ? "9000" : obj.quality;
    if (!quality || obj.isAudioOnly) quality = "9000";

    let api = await fetch(`https://player.vimeo.com/video/${obj.id}/config`).then((r) => { return r.json() }).catch(() => { return false });
    if (!api) return { error: 'ErrorCouldntFetch' };

    let downloadType = "dash";
    if (!obj.forceDash && JSON.stringify(api).includes('"progressive":[{')) downloadType = "progressive";

    let fileMetadata = {
        title: cleanString(api.video.title.trim()),
        artist: cleanString(api.video.owner.name.trim()),
    }

    if (downloadType !== "dash") {
        if (qualityMatch[quality]) quality = qualityMatch[quality];
        let all = api["request"]["files"]["progressive"].sort((a, b) => Number(b.width) - Number(a.width));
        let best = all[0];

        let bestQuality = all[0]["quality"].split('p')[0];
        bestQuality = qualityMatch[bestQuality] ? qualityMatch[bestQuality] : bestQuality;
        if (Number(quality) < Number(bestQuality)) best = all.find(i => i["quality"].split('p')[0] === quality);

        if (!best) return { error: 'ErrorEmptyDownload' };
        return {
            urls: best["url"],
            audioFilename: `vimeo_${obj.id}_audio`,
            filename: `vimeo_${obj.id}_${best["width"]}x${best["height"]}.mp4`
        }
    }

    if (api.video.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let masterJSONURL = api["request"]["files"]["dash"]["cdns"]["akfire_interconnect_quic"]["url"];
    let masterJSON = await fetch(masterJSONURL).then((r) => { return r.json() }).catch(() => { return false });

    if (!masterJSON) return { error: 'ErrorCouldntFetch' };
    if (!masterJSON.video) return { error: 'ErrorEmptyDownload' };

    let type = "parcel";
    if (masterJSON.base_url === "../") type = "chop";

    let masterJSON_Video = masterJSON.video.sort((a, b) => Number(b.width) - Number(a.width)),
        bestVideo = masterJSON_Video[0];
    if (Number(quality) < Number(resolutionMatch[bestVideo["width"]])) bestVideo = masterJSON_Video.find(i => resolutionMatch[i["width"]] === quality);

    let videoUrl, audioUrl, baseUrl = masterJSONURL.split("/sep/")[0];
    switch (type) {
        case "parcel":
            let masterJSON_Audio = masterJSON.audio.sort((a, b) => Number(b.bitrate) - Number(a.bitrate)).filter(a => a['mime_type'] === "audio/mp4"),
                bestAudio = masterJSON_Audio[0];
            videoUrl = `${baseUrl}/parcel/video/${bestVideo.index_segment.split('?')[0]}`,
            audioUrl = `${baseUrl}/parcel/audio/${bestAudio.index_segment.split('?')[0]}`;
            break;
        case "chop":
            videoUrl = `${baseUrl}/sep/video/${bestVideo.id}/master.m3u8`;
            break;
    }
    if (videoUrl) {
        return {
            urls: audioUrl ? [videoUrl, audioUrl] : videoUrl,
            isM3U8: audioUrl ? false : true,
            fileMetadata: fileMetadata,
            filenameAttributes: {
                service: "vimeo",
                id: obj.id,
                title: fileMetadata.title,
                author: fileMetadata.artist,
                resolution: `${bestVideo["width"]}x${bestVideo["height"]}`,
                qualityLabel: `${bestVideo["height"]}p`,
                extension: "mp4"
            }
        }
    }
    return { error: 'ErrorEmptyDownload' }
}
