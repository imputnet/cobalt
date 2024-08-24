import { cleanString } from "../../misc/utils.js";
import { genericUserAgent, env } from "../../config.js";

const resolutions = ["2160", "1440", "1080", "720", "480", "360", "240"];

export default async function(o) {
    let html, url, quality = o.quality === "max" ? 2160 : o.quality;

    html = await fetch(`https://vk.com/video${o.userId}_${o.videoId}`, {
        headers: {
            "user-agent": genericUserAgent
        }
    })
    .then(r => r.arrayBuffer())
    .catch(() => {});

    if (!html) return { error: "fetch.fail" };

    // decode cyrillic from windows-1251 because vk still uses apis from prehistoric times
    let decoder = new TextDecoder('windows-1251');
    html = decoder.decode(html);

    if (!html.includes(`{"lang":`)) return { error: "fetch.empty" };

    let js = JSON.parse('{"lang":' + html.split(`{"lang":`)[1].split(']);')[0]);

    if (Number(js.mvData.is_active_live) !== 0) {
        return { error: "content.video.live" };
    }

    if (js.mvData.duration > env.durationLimit) {
        return { error: "content.too_long" };
    }

    for (let i in resolutions) {
        if (js.player.params[0][`url${resolutions[i]}`]) {
            quality = resolutions[i];
            break
        }
    }
    if (Number(quality) > Number(o.quality)) quality = o.quality;

    url = js.player.params[0][`url${quality}`];

    let fileMetadata = {
        title: cleanString(js.player.params[0].md_title.trim()),
        author: cleanString(js.player.params[0].md_author.trim()),
    }

    if (url) return {
        urls: url,
        filenameAttributes: {
            service: "vk",
            id: `${o.userId}_${o.videoId}`,
            title: fileMetadata.title,
            author: fileMetadata.author,
            resolution: `${quality}p`,
            qualityLabel: `${quality}p`,
            extension: "mp4"
        }
    }
    return { error: "fetch.empty" }
}
