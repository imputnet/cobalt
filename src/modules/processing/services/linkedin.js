import { genericUserAgent } from "../../config.js";

const qualityMatch = {
    // "feedshare-ambry-analyzed_servable_progressive_video": "1080",   can vary!
    "mp4-720p-30fp-crf28": "720",
    "mp4-640p-30fp-crf28": "640"
}

const height = {
    //"1080": "1920",
    "720": "1280",
    "640": "1138"
}

export default async function(obj) {
    let html = await fetch(`https://www.linkedin.com/posts/${obj["user"]}_${obj["id"]}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { console.log("FALSE"); return false });

    if (!html) return { error: 'ErrorCouldntFetch' };

    let data = html.split("data-sources=\"")[1].split("\" data-poster-url")[0]
    data = data.replaceAll("&quot;", "\"").replaceAll("&amp;", "&")
    let dataSources = JSON.parse(data)

    let available = dataSources.map(ob => qualityMatch[ob["src"].split("/")[5]])
    // let bestQuality;
    // if (obj.quality === "max" || Number(obj.quality) > 1080) bestQuality = "1080";
    // else if (Number(obj.quality) < 720) bestQuality = "640";
    // else bestQuality = (available.includes(obj.quality)) ? obj.quality : "720";
    let bestQuality = (Number(obj.quality) >= 720) ? "720" : "640";
    if (!available.includes(bestQuality)) bestQuality = (bestQuality === "720") ? "640" : "720";

    return {
        urls: dataSources[available.indexOf(bestQuality)]["src"],
        filename: `linkedin_${obj["id"].slice(-24)}_${bestQuality}x${height[bestQuality]}.mp4`
    }
}