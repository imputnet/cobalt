import ytdl from "better-ytdl-core";
import { maxVideoDuration, quality as mq } from "../../config.js";
import selectQuality from "../../stream/selectQuality.js";

export default async function(obj) {
    let isAudioOnly = !!obj.isAudioOnly,
        infoInitial = await ytdl.getInfo(obj.id);
    if (!infoInitial) return { error: 'ErrorCantConnectToServiceAPI' };

    let info = infoInitial.formats;
    if (info[0]["isLive"]) return { error: 'ErrorLiveVideo' };

    let videoMatch = [], fullVideoMatch = [], video = [],
    audio = info.filter((a) => {
        if (!a["isHLS"] && !a["isDashMPD"] && a["hasAudio"] && !a["hasVideo"] && a["container"] == obj.format) return true
    }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    if (audio.length === 0) return { error: 'ErrorBadFetch' };
    if (audio[0]["approxDurationMs"] > maxVideoDuration) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    if (!isAudioOnly) {
        video = info.filter((a) => {
            if (!a["isHLS"] && !a["isDashMPD"] && a["hasVideo"] && a["container"] == obj.format) {
                if (obj.quality != "max") {
                    if (a["hasAudio"] && mq[obj.quality] == a["height"]) {
                        fullVideoMatch.push(a)
                    } else if (!a["hasAudio"] && mq[obj.quality] == a["height"]) {
                        videoMatch.push(a)
                    }
                }
                return true
            }
        }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

        if (obj.quality != "max") {
            if (videoMatch.length === 0) {
                let ss = selectQuality("youtube", obj.quality, video[0]["qualityLabel"].slice(0, 5).replace('p', '').trim());
                videoMatch = video.filter((a) => {
                    if (a["qualityLabel"].slice(0, 5).replace('p', '').trim() == ss) return true
                })
            } else if (fullVideoMatch.length > 0) {
                videoMatch = [fullVideoMatch[0]]
            }
        } else videoMatch = [video[0]];
        if (obj.quality === "los") videoMatch = [video[video.length - 1]];
    }
    if (video.length === 0) isAudioOnly = true;

    if (isAudioOnly) {
        let r = {
            type: "render",
            isAudioOnly: true,
            urls: audio[0]["url"],
            audioFilename: `youtube_${obj.id}_audio`,
            fileMetadata: {
                title: infoInitial.videoDetails.title,
                artist: infoInitial.videoDetails.ownerChannelName.replace("- Topic", "").trim(),
            }
        }
        if (infoInitial.videoDetails.description) {
            let isAutoGenAudio = infoInitial.videoDetails.description.startsWith("Provided to YouTube by");
            if (isAutoGenAudio) {
                let descItems = infoInitial.videoDetails.description.split("\n\n")
                r.fileMetadata.album = descItems[2]
                r.fileMetadata.copyright = descItems[3]
                if (descItems[4].startsWith("Released on:")) r.fileMetadata.date = descItems[4].replace("Released on: ", '').trim();
            }
        }
        return r
    }
    let singleTest;
    if (videoMatch.length > 0) {
        singleTest = videoMatch[0]["hasVideo"] && videoMatch[0]["hasAudio"];
        return {
            type: singleTest ? "bridge" : "render",
            urls: singleTest ? videoMatch[0]["url"] : [videoMatch[0]["url"], audio[0]["url"]],
            time: videoMatch[0]["approxDurationMs"],
            filename: `youtube_${obj.id}_${videoMatch[0]["width"]}x${videoMatch[0]["height"]}.${obj.format}`
        }
    }
    singleTest = video[0]["hasVideo"] && video[0]["hasAudio"];
    return {
        type: singleTest ? "bridge" : "render",
        urls: singleTest ? video[0]["url"] : [video[0]["url"], audio[0]["url"]],
        time: video[0]["approxDurationMs"],
        filename: `youtube_${obj.id}_${video[0]["width"]}x${video[0]["height"]}.${obj.format}`
    }
}
