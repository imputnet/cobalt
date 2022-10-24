import ytdl from "ytdl-core";
import loc from "../../localization/manager.js";
import { maxVideoDuration, quality as mq } from "../config.js";
import selectQuality from "../stream/selectQuality.js";

export default async function(obj) {
    try {
        let infoInitial = await ytdl.getInfo(obj.id);
        if (infoInitial) {
            let info = infoInitial.formats;
            if (!info[0]["isLive"]) {
                let videoMatch = [], fullVideoMatch = [], video = [], audio = info.filter((a) => {
                    if (!a["isHLS"] && !a["isDashMPD"] && a["hasAudio"] && !a["hasVideo"] && a["container"] === obj.format) return true;
                }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                if (!obj.isAudioOnly) {
                    video = info.filter((a) => {
                        if (!a["isHLS"] && !a["isDashMPD"] && a["hasVideo"] && a["container"] === obj.format && a["height"] !== 4320) {
                            if (obj.quality !== "max") {
                                if (a["hasAudio"] && mq[obj.quality] === a["height"]) {
                                    fullVideoMatch.push(a)
                                } else if (!a["hasAudio"] && mq[obj.quality] === a["height"]) {
                                    videoMatch.push(a);
                                }
                            }
                            return true
                        }
                    }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));
                    if (obj.quality !== "max") {
                        if (videoMatch.length === 0) {
                            let ss = selectQuality("youtube", obj.quality, video[0]["qualityLabel"].slice(0, 5).replace('p', '').trim())
                            videoMatch = video.filter((a) => {
                                if (a["qualityLabel"].slice(0, 5).replace('p', '').trim() === ss) return true;
                            })
                        } else if (fullVideoMatch.length > 0) {
                            videoMatch = [fullVideoMatch[0]]
                        }
                    } else videoMatch = [video[0]];
                    if (obj.quality === "los") videoMatch = [video[video.length - 1]];
                }
                let generalMeta = {
                    title: infoInitial.videoDetails.title,
                    artist: infoInitial.videoDetails.ownerChannelName.replace("- Topic", "").trim(),
                }
                if (audio[0]["approxDurationMs"] <= maxVideoDuration) {
                    if (!obj.isAudioOnly && videoMatch.length > 0) {
                        if (video.length > 0 && audio.length > 0) {
                            if (videoMatch[0]["hasVideo"] && videoMatch[0]["hasAudio"]) {
                                return {
                                    type: "bridge", urls: videoMatch[0]["url"], time: videoMatch[0]["approxDurationMs"],
                                    filename: `youtube_${obj.id}_${videoMatch[0]["width"]}x${videoMatch[0]["height"]}.${obj.format}`
                                };
                            } else {
                                return {
                                    type: "render", urls: [videoMatch[0]["url"], audio[0]["url"]], time: videoMatch[0]["approxDurationMs"],
                                    filename: `youtube_${obj.id}_${videoMatch[0]["width"]}x${videoMatch[0]["height"]}.${obj.format}`
                                };
                            }
                        } else {
                            return { error: loc(obj.lang, 'ErrorBadFetch') };
                        }
                    } else if (!obj.isAudioOnly) {
                        return {
                            type: "render", urls: [video[0]["url"], audio[0]["url"]], time: video[0]["approxDurationMs"],
                            filename: `youtube_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.${video[0]["container"]}`
                        };
                    } else if (audio.length > 0) {
                        let r = {
                            type: "render",
                            isAudioOnly: true,
                            urls: audio[0]["url"],
                            audioFilename: `youtube_${obj.id}_audio`,
                            fileMetadata: generalMeta
                        };
                        let isAutoGenAudio = infoInitial.videoDetails.description.startsWith("Provided to YouTube by");
                        if (isAutoGenAudio) {
                            let descItems = infoInitial.videoDetails.description.split("\n\n")
                            r.fileMetadata.album = descItems[2]
                            r.fileMetadata.copyright = descItems[3]
                            r.fileMetadata.date = descItems[4].replace("Released on: ", '').trim()
                        }
                        return r
                    } else {
                        return { error: loc(obj.lang, 'ErrorBadFetch') };
                    }
                } else {
                    return { error: loc(obj.lang, 'ErrorLengthLimit', maxVideoDuration / 60000) };
                }
            } else {
                return { error: loc(obj.lang, 'ErrorLiveVideo') };
            }
        } else {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI') };
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
