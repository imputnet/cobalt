import ytdl from "ytdl-core";
import loc from "../sub/i18n.js";
import { maxVideoDuration, quality as mq } from "../config.js";
import selectQuality from "../stream/selectQuality.js";

export default async function (obj) {
    try {
        let info = await ytdl.getInfo(obj.id);
        if (info) {
            info = info.formats;
            if (!info[0]["isLive"]) {
                let videoMatch = [], fullVideoMatch = [], video = [], audio = info.filter((a) => {
                    if (!a["isHLS"] && !a["isDashMPD"] && a["hasAudio"] && !a["hasVideo"] && a["container"] == obj.format) return true;
                }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                if (!obj.isAudioOnly) {
                    video = info.filter((a) => {
                        if (!a["isHLS"] && !a["isDashMPD"] && a["hasVideo"] && a["container"] == obj.format && a["height"] != 4320) {
                            if (obj.quality != "max") {
                                if (a["hasAudio"] && mq[obj.quality] == a["height"]) {
                                    fullVideoMatch.push(a)
                                } else if (!a["hasAudio"] && mq[obj.quality] == a["height"]) {
                                    videoMatch.push(a);
                                }
                            }
                            return true
                        }
                    }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                    if (obj.quality != "max") {
                        if (videoMatch.length == 0) {
                            let ss = selectQuality("youtube", obj.quality, video[0]["height"])
                            videoMatch = video.filter((a) => {
                                if (a["height"] == ss) return true;
                            })
                        } else if (fullVideoMatch.length > 0) {
                            videoMatch = [fullVideoMatch[0]]
                        }
                    } else videoMatch = [video[0]];
                    if (obj.quality == "los") videoMatch = [video[video.length - 1]];
                }
                if (audio[0]["approxDurationMs"] <= maxVideoDuration) {
                    if (!obj.isAudioOnly && videoMatch.length > 0) {
                        if (video.length > 0 && audio.length > 0) {
                            if (videoMatch[0]["hasVideo"] && videoMatch[0]["hasAudio"]) {
                                return { type: "bridge", urls: videoMatch[0]["url"], time: videoMatch[0]["approxDurationMs"],
                            filename: `youtube_${obj.id}_${videoMatch[0]["width"]}x${videoMatch[0]["height"]}.${obj.format}` };
                            } else {
                                return { type: "render", urls: [videoMatch[0]["url"], audio[0]["url"]], time: videoMatch[0]["approxDurationMs"],
                            filename: `youtube_${obj.id}_${videoMatch[0]["width"]}x${videoMatch[0]["height"]}.${obj.format}` };
                            }
                        } else {
                            return { error: loc('en', 'apiError', 'errorFetch') };
                        }
                    } else if (!obj.isAudioOnly) {
                        return { type: "render", urls: [video[0]["url"], audio[0]["url"]], time: video[0]["approxDurationMs"],
                            filename: `youtube_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.${video[0]["container"]}` };
                    } else if (audio.length > 0) {
                        return { type: "render", isAudioOnly: true, urls: [audio[0]["url"]], filename: `youtube_${obj.id}_${audio[0]["audioBitrate"]}kbps.opus` };
                    } else {
                        return { error: loc('en', 'apiError', 'errorFetch') };
                    }
                } else {
                    return { error: loc('en', 'apiError', 'lengthLimit', maxVideoDuration / 60000) };
                }
            } else {
                return { error: loc('en', 'apiError', 'liveVideo') };
            }
        } else {
            return { error: loc('en', 'apiError', 'youtubeFetch') };
        }
    } catch (e) {
        return { error: loc('en', 'apiError', 'youtubeFetch') };
    }
}

