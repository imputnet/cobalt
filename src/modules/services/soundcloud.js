import { genericUserAgent, maxAudioDuration, services } from "../config.js";

export default async function(obj) {
    try {
        let html;
        if (!obj.author && !obj.song && obj.shortLink) {
            html = await fetch(`https://soundcloud.app.goo.gl/${obj.shortLink}/`, {
                headers: {"user-agent": genericUserAgent}
            }).then(async (r) => {return await r.text()}).catch(() => {return false});
        }
        if (obj.author && obj.song) {
            html = await fetch(`https://soundcloud.com/${obj.author}/${obj.song}`, {
                headers: {"user-agent": genericUserAgent}
            }).then(async (r) => {return await r.text()}).catch(() => {return false});
        }
        if (!html) return { error: 'ErrorCouldntFetch'};
        if (html.includes('<script>window.__sc_hydration = ') && html.includes('"format":{"protocol":"progressive","mime_type":"audio/mpeg"},') && html.includes('{"hydratable":"sound","data":')) {
            let json = JSON.parse(html.split('{"hydratable":"sound","data":')[1].split('}];</script>')[0])
            if (json["media"]["transcodings"]) {
                let fileUrl = `${json.media.transcodings[0]["url"].replace("/hls", "/progressive")}?client_id=${services["soundcloud"]["clientid"]}&track_authorization=${json.track_authorization}`;
                if (fileUrl.substring(0, 54) === "https://api-v2.soundcloud.com/media/soundcloud:tracks:") {
                    if (json.duration < maxAudioDuration) {
                        let file = await fetch(fileUrl).then(async (r) => {return (await r.json()).url}).catch(() => {return false});
                        if (!file) return { error: 'ErrorCouldntFetch' };
                        return {
                            urls: file,
                            audioFilename: `soundcloud_${json.id}`,
                            fileMetadata: {
                                title: json.title,
                                artist: json.user.username,
                            }
                        }
                    } else return { error: ['ErrorLengthAudioConvert', maxAudioDuration / 60000] }
                }
            } else return { error: 'ErrorEmptyDownload' }
        } else return { error: ['ErrorBrokenLink', 'soundcloud'] }
    } catch (e) {
        return { error: 'ErrorBadFetch' };
    }
}
