import { quality, services } from "../config.js";

export default async function(obj) {
    try {
        let api = await fetch(`https://player.vimeo.com/video/${obj.id}/config`).then((r) => {return r.json()}).catch(() => {return false});
        if (!api) return { error: 'ErrorCouldntFetch' };

        let downloadType = "";
        if (JSON.stringify(api).includes('"progressive":[{')) {
            downloadType = "progressive";
        } else if (JSON.stringify(api).includes('"files":{"dash":{"')) downloadType = "dash";

        switch(downloadType) {
            case "progressive":
                let all = api["request"]["files"]["progressive"].sort((a, b) => Number(b.width) - Number(a.width));
                let best = all[0]
                try {
                    if (obj.quality != "max") {
                        let pref = parseInt(quality[obj.quality], 10)
                        for (let i in all) {
                            let currQuality = parseInt(all[i]["quality"].replace('p', ''), 10)
                            if (currQuality < pref) {
                                break;
                            } else if (currQuality == pref) {
                                best = all[i]
                            }
                        }
                    }
                } catch (e) {
                    best = all[0]
                }
                return { urls: best["url"], filename: `tumblr_${obj.id}.mp4` };
            case "dash":
                let masterJSONURL = api["request"]["files"]["dash"]["cdns"]["akfire_interconnect_quic"]["url"];
                let masterJSON = await fetch(masterJSONURL).then((r) => {return r.json()}).catch(() => {return false});
                if (!masterJSON) return { error: 'ErrorCouldntFetch' };
                if (masterJSON.video) {
                    let type = "";
                    if (masterJSON.base_url.includes("parcel")) {
                        type = "parcel"
                    } else if (masterJSON.base_url == "../") {
                        type = "chop"
                    }
                    let masterJSON_Video = masterJSON.video.sort((a, b) => Number(b.width) - Number(a.width));
                    let masterJSON_Audio = masterJSON.audio.sort((a, b) => Number(b.bitrate) - Number(a.bitrate)).filter((a)=> {if (a['mime_type'] === "audio/mp4") return true;});
                    
                    let bestVideo = masterJSON_Video[0]
                    let bestAudio = masterJSON_Audio[0]
                    switch (type) {
                        case "parcel":
                            if (obj.quality != "max") {
                                let pref = parseInt(quality[obj.quality], 10)
                                for (let i in masterJSON_Video) {
                                    let currQuality = parseInt(services.vimeo.resolutionMatch[masterJSON_Video[i]["width"]], 10)
                                    if (currQuality < pref) {
                                        break;
                                    } else if (currQuality == pref) {
                                        bestVideo = masterJSON_Video[i]
                                    }
                                }
                            }
                            let baseUrl = masterJSONURL.split("/sep/")[0]
                            let videoUrl = `${baseUrl}/parcel/video/${bestVideo.index_segment.split('?')[0]}`;
                            let audioUrl = `${baseUrl}/parcel/audio/${bestAudio.index_segment.split('?')[0]}`;

                            return { urls: [videoUrl, audioUrl], audioFilename: `vimeo_${obj.id}_audio`, filename: `vimeo_${obj.id}_${bestVideo["width"]}x${bestVideo["height"]}.mp4` }
                        case "chop": // TO-DO: support chop type of streams
                        default:
                            return { error: 'ErrorEmptyDownload' }
                    }
                } else {
                    return { error: 'ErrorEmptyDownload' }
                }
            default:
                return { error: 'ErrorEmptyDownload' }
        }
    } catch (e) {
        return { error: 'ErrorBadFetch' };
    }
}
