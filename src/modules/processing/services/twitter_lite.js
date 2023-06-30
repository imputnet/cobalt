function bestQuality(arr) {
    return arr.filter((v) => { if (v["content_type"] === "video/mp4") return true }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split("?")[0]
}

export default async function(obj) {
    if (!obj.spaceId) {
        let synd = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${obj.id}`, {
            headers: {
                "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)"
            }
        }).then((r) => { return r.status === 200 ? r.text() : false }).catch((e) => { return false });
        if (!synd) {
            return { error: 'ErrorTweetUnavailable' }
        } else {
            synd = JSON.parse(synd);
        }
        if (!synd.mediaDetails) return { error: 'ErrorNoVideosInTweet' };

        let single, multiple = [], media = synd.mediaDetails;
        media = media.filter((i) => { if (i["type"] === "video" || i["type"] === "animated_gif") return true })
        if (media.length > 1) {
            for (let i in media) { multiple.push({type: "video", thumb: media[i]["media_url_https"], url: bestQuality(media[i]["video_info"]["variants"])}) }
        } else if (media.length === 1) {
            single = bestQuality(media[0]["video_info"]["variants"])
        } else {
            return { error: 'ErrorNoVideosInTweet' }
        }

        if (single) {
            return { urls: single, filename: `twitter_${obj.id}.mp4`, audioFilename: `twitter_${obj.id}_audio` }
        } else if (multiple) {
            return { picker: multiple }
        } else {
            return { error: 'ErrorNoVideosInTweet' }
        }
    } else {
        return { error: 'ErrorTwitterRIP' }
    }
}
