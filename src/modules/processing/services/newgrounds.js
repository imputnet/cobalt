import { genericUserAgent } from "../../config.js";
import { cleanString } from "../../sub/utils.js";

export default async function(obj) {
    let req;
    // handle video downloads
    if (obj.type == 'portal') {
        req = await fetch(`https://www.newgrounds.com/${obj.type}/video/${obj.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json, text/javascript, */*; q=0.01'
            }
        })
        .then(request => request.text())
        .catch(() => {});

        if (!req) return { error: 'ErrorEmptyDownload' };
    }

    // handle audio downloads
    if (obj.type == 'audio') {
        req = await fetch(`https://www.newgrounds.com/audio/listen/${obj.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
            }
        })
        .then(request => request.text())
        .catch(() => {});

        if (!req) return { error: 'ErrorEmptyDownload' };

        const title = req.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
        const artist = req.match(/"artist"\s*:\s*"([^"]+)"/)?.[1];
        let fileMetadata = {
            title: cleanString(decodeURIComponent(title.trim())),
            artist: cleanString(decodeURIComponent(artist.trim())),
        }

        const url = req.match(/"filename"\s*:\s*"([^"]+)"/)?.[1]?.replace(/\\\//g, '/');
    
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