import { genericUserAgent } from "../../config.js";
import { cleanString } from "../../sub/utils.js";

export default async function(obj) {
    console.log(obj.type)
    // handle video downloads
    if (obj.type == 'portal') {
        let req = await fetch(`https://www.newgrounds.com/${obj.type}/video/${obj.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(request => request.text())
        .catch(() => {});

        if (!req) return { error: 'ErrorEmptyDownload' };

        const json = JSON.parse(req);
        const highestQuality = Object.keys(json.sources)[0];
        const video = json.sources[highestQuality][0].src

        return {
            urls: video
        }
    }

    // handle audio downloads
    if (obj.type == 'audio') {
        let req = await fetch(`https://www.newgrounds.com/audio/listen/${obj.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
            }
        })
        .then(request => request.text())
        .catch(() => {});

        if (!req) return { error: 'ErrorEmptyDownload' };

        const title = req.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
        const artist = req.match(/"artist"\s*:\s*"([^"]+)"/)?.[1];
        const url = req.match(/"filename"\s*:\s*"([^"]+)"/)?.[1]?.replace(/\\\//g, '/');
        let fileMetadata = {
            title: cleanString(decodeURIComponent(title.trim())),
            artist: cleanString(decodeURIComponent(artist.trim())),
        }
    
        return {
                urls: url,
                filenameAttributes: {
                    service: "newgrounds",
                    id: obj.id,
                    title: fileMetadata.title,
                    author: fileMetadata.artist
                },
            }
        }
    }