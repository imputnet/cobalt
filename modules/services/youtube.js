import ytdl from "ytdl-core";
import loc from "../sub/loc.js";
import { maxVideoDuration, quality as mq } from "../config.js";
import selectQuality from "../stream/select-quality.js";

export default async function (obj) {
    try {
        let info = await ytdl.getInfo(obj.id);
        if (info) {
            info = info.formats;
            if (!info[0]["isLive"]) {
                if (obj.isAudioOnly) {
                    obj.format = "webm"
                    obj.quality = "max"
                }
                let selectedVideo, videoMatch = [], video = [], audio = info.filter((a) => {
                    if (!a["isLive"] && !a["isHLS"] && !a["isDashMPD"] && a["hasAudio"] && !a["hasVideo"] && a["container"] == obj.format) {
                        return true;
                    }
                }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                if (!obj.isAudioOnly) {
                    video = info.filter((a) => {
                        if (!a["isLive"] && !a["isHLS"] && !a["isDashMPD"] && !a["hasAudio"] && a["hasVideo"] && a["container"] == obj.format && a["height"] != 4320) {
                            if (obj.quality != "max" && mq[obj.quality] == a["height"]) {
                                videoMatch.push(a)
                            }
                            return true;
                        }
                    }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                    selectedVideo = video[0]
                    if (obj.quality != "max") {
                        if (videoMatch.length > 0) {
                            selectedVideo = videoMatch[0]
                        } else {
                            let ss = selectQuality("youtube", obj.quality, video[0]["height"])
                            selectedVideo = video.filter((a) => {
                                if (a["height"] == ss) {
                                    return true
                                }
                            })
                            selectedVideo = selectedVideo[0]
                        }
                    }
                    if (obj.quality == "los") {
                        selectedVideo = video[video.length - 1]
                    }
                }
                if (audio[0]["approxDurationMs"] <= maxVideoDuration) {
                    if (!obj.isAudioOnly && video.length > 0) {
                        let filename = `youtube_${obj.id}_${selectedVideo["width"]}x${selectedVideo["height"]}.${obj.format}`;
                        if (video.length > 0 && audio.length > 0) {
                            return { type: "render", urls: [selectedVideo["url"], audio[0]["url"]], time: video[0]["approxDurationMs"], filename: filename };
                        } else {
                            return { error: loc('en', 'apiError', 'youtubeBroke') };
                        }
                    } else if (audio.length > 0) {
                        return { type: "render", isAudioOnly: true, urls: [audio[0]["url"]], filename: `youtube_${obj.id}_${audio[0]["audioBitrate"]}kbps.opus` };
                    } else {
                        return { error: loc('en', 'apiError', 'youtubeBroke') };
                    }
                } else {
                    return { error: loc('en', 'apiError', 'youtubeLimit', maxVideoDuration / 60000) };
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

