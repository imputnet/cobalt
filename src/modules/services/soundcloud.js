import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent, maxAudioDuration, services } from "../config.js";

export default async function(obj) {
    try {
        let html;
        if (!obj.author && !obj.song && obj.shortLink) {
            html = await got.get(`https://soundcloud.app.goo.gl/${obj.shortLink}/`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCouldntFetch', 'soundcloud') };
            });
            html = html.body
        }
        if (obj.author && obj.song) {
            html = await got.get(`https://soundcloud.com/${obj.author}/${obj.song}`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCouldntFetch', 'soundcloud') };
            });
            html = html.body
        }
        if (html.includes('<script>window.__sc_hydration = ') && html.includes('"format":{"protocol":"progressive","mime_type":"audio/mpeg"},') && html.includes('{"hydratable":"sound","data":')) {
            let json = JSON.parse(html.split('{"hydratable":"sound","data":')[1].split('}];</script>')[0])
            if (json["media"]["transcodings"]) {
                let fileUrl = `${json.media.transcodings[0]["url"].replace("/hls", "/progressive")}?client_id=${services["soundcloud"]["clientid"]}&track_authorization=${json.track_authorization}`;
                if (fileUrl.substring(0, 54) == "https://api-v2.soundcloud.com/media/soundcloud:tracks:") {
                    if ((json.duration < maxAudioDuration) || obj.format == "best" || obj.format == "mp3") {
                        let file = await got.get(fileUrl, { headers: { "user-agent": genericUserAgent } });
                        file.on('error', (err) => {
                            return { error: loc(obj.lang, 'ErrorCouldntFetch', 'soundcloud') };
                        });
                        file = JSON.parse(file.body).url
                        return { urls: file, audioFilename: `soundcloud_${json.id}` }
                    } else return { error: loc(obj.lang, 'ErrorLengthAudioConvert', maxAudioDuration / 60000) }
                }
            } else return { error: loc(obj.lang, 'ErrorEmptyDownload') }
        } else return { error: loc(obj.lang, 'ErrorBrokenLink', 'soundcloud') }
    } catch (e) {
        console.log(e)
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
