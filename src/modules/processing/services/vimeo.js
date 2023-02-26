import { maxVideoDuration } from "../../config.js";

const resolutionMatch = {
    "3840": "2160",
    "1920": "1080",
    "1280": "720",
    "960": "480"
}

export default async function(obj) {
    let api = await fetch(`https://player.vimeo.com/video/${obj.id}/config`).then((r) => { return r.json() }).catch(() => { return false });
    if (!api) return { error: 'ErrorCouldntFetch' };

    let downloadType = "dash";
    if (JSON.stringify(api).includes('"progressive":[{')) downloadType = "progressive";

    switch(downloadType) {
        case "progressive":
            let all = api["request"]["files"]["progressive"].sort((a, b) => Number(b.width) - Number(a.width));
            let best = all[0];

            try {
                if (obj.quality !== "max") {
                    let pref = parseInt(obj.quality, 10)
                    for (let i in all) {
                        let currQuality = parseInt(all[i]["quality"].replace('p', ''), 10)
                        if (currQuality === pref) {
                            best = all[i];
                            break
                        }
                        if (currQuality < pref) {
                            best = all[i-1];
                            break
                        }
                    }
                }
            } catch (e) {
                best = all[0]
            }

            return { urls: best["url"], filename: `tumblr_${obj.id}.mp4` };
        case "dash":
            if (api.video.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

            let masterJSONURL = api["request"]["files"]["dash"]["cdns"]["akfire_interconnect_quic"]["url"];
            let masterJSON = await fetch(masterJSONURL).then((r) => { return r.json() }).catch(() => { return false });

            if (!masterJSON) return { error: 'ErrorCouldntFetch' };
            if (!masterJSON.video) return { error: 'ErrorEmptyDownload' };

            let type = "parcel";
            if (masterJSON.base_url === "../") type = "chop";

            let masterJSON_Video = masterJSON.video.sort((a, b) => Number(b.width) - Number(a.width));
            let masterJSON_Audio = masterJSON.audio.sort((a, b) => Number(b.bitrate) - Number(a.bitrate)).filter((a)=> {if (a['mime_type'] === "audio/mp4") return true;});
            let bestVideo = masterJSON_Video[0], bestAudio = masterJSON_Audio[0];

            switch (type) {
                case "parcel":
                    if (obj.quality !== "max") {
                        let pref = parseInt(obj.quality, 10)
                        for (let i in masterJSON_Video) {
                            let currQuality = parseInt(resolutionMatch[masterJSON_Video[i]["width"]], 10)
                            if (currQuality < pref) {
                                break;
                            } else if (String(currQuality) === String(pref)) {
                                bestVideo = masterJSON_Video[i]
                            }
                        }
                    }

                    let baseUrl = masterJSONURL.split("/sep/")[0];
                    let videoUrl = `${baseUrl}/parcel/video/${bestVideo.index_segment.split('?')[0]}`,
                        audioUrl = `${baseUrl}/parcel/audio/${bestAudio.index_segment.split('?')[0]}`;

                    return { urls: [videoUrl, audioUrl], audioFilename: `vimeo_${obj.id}_audio`, filename: `vimeo_${obj.id}_${bestVideo["width"]}x${bestVideo["height"]}.mp4` }
                case "chop": // TO-DO: support for chop stream type
                default:
                    return { error: 'ErrorEmptyDownload' }
            }
        default:
            return { error: 'ErrorEmptyDownload' }
    }
}
