import { env } from "../../config.js";

const ntvApi = 'https://www.ntv.ru/api/player/?id=';

// the most generic user agent 
export const clientAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0";

const getVideo = async (videoID) => {
    const video = await fetch(`${ntvApi}${videoID}`, {
        method: "GET",
        headers: {
            "user-agent": clientAgent,
        }
    })
    .then(r => {
        if (r.status === 200) {
            return r.json();
        }
    });

    return video;
}

export default async function (obj) {
    let video = null;

    if (obj.name && obj.name.length > 0) {
        const fetchID = await fetch(`https://www.ntv.ru/peredacha/${obj.name}/m${obj.showid}/o${obj.videoid}`, {
            method: "GET",
            headers: {
                "user-agent": clientAgent,
            }
        })
        .then(r => {
            if (r.status === 200) {
                return r.text();
            }
        });

        let figuredVideoId = null;
        const match = String(fetchID).match(/<meta\s+property="og:video:url"\s+content="https:\/\/www\.ntv\.ru\/embed\/(\d+)\/?"/i);
        if (match && match[1]) {
            figuredVideoId = match[1];
        } else {
            return { error: "fetch.fail" };
        }
        
        video = await getVideo(figuredVideoId);
    } else {
        video = await getVideo(obj.videoid);
    }

    if (!video) {
        return { error: "fetch.empty" };
    }

    if (!video.playback || !video.totaltime) {
        return { error: "fetch.fail" };
    }

    if (video.totaltime > env.durationLimit) {
        return { error: "content.too_long" };
    }

    const userQuality = obj.quality === "max" ? "1080" : obj.quality;
    let url = null;

    // for hls there's 144p, 360p, 720p and 1080p available, but for mp4 only 360p and 1080p
    // we'll use mp4 to simplify things
    switch (userQuality) {
        case "1080":
            url = video.playback.hd_video;
            break;
        case "720":
        case "480":
        case "360":
            url = video.playback.video;
            break;
        default:
            // 360 by default
            url = video.playback.video;
    }

    if (!url) return { error: "fetch.fail" };

    const fileMetadata = {
        title: video.description.trim(),
        // despite the param name, it actually contains the video title with the name of the show
    }

    return {
        urls: url,
        fileMetadata,
        filenameAttributes: {
            service: "ntv",
            id: `${obj.videoid}`,
            title: fileMetadata.title,
            extension: "mp4"
        }
    }
}
