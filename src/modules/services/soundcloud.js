import { genericUserAgent, maxAudioDuration } from "../config.js";

let cachedID = {}

async function findClientID() {
    try {
        let sc = await fetch('https://soundcloud.com/').then((r) => {return r.text()}).catch(() => {return false});
        let sc_version = String(sc.match(/<script>window\.__sc_version="[0-9]{10}"<\/script>/)[0].match(/[0-9]{10}/));

        if (cachedID.version == sc_version) {
            return cachedID.id
        } else {
            let scripts = sc.matchAll(/<script.+src="(.+)">/g);
            let clientid;
            for (let script of scripts) {
                let url = script[1];
    
                if (url && !url.startsWith('https://a-v2.sndcdn.com')) return;
    
                let scrf = await fetch(url).then((r) => {return r.text()}).catch(() => {return false});
                let id = scrf.match(/\("client_id=[A-Za-z0-9]{32}"\)/);
    
                if (id && typeof id[0] === 'string') {
                    clientid = id[0].match(/[A-Za-z0-9]{32}/)[0];
                    break;
                }
            }
            cachedID.version = sc_version;
            cachedID.id = clientid;
            return clientid;
        }
        
    } catch (e) {
        return false;
    }
}

export default async function(obj) {
    try {
        let html;
        if (!obj.author && !obj.song && obj.shortLink) {
            html = await fetch(`https://soundcloud.app.goo.gl/${obj.shortLink}/`, {
                headers: {"user-agent": genericUserAgent}
            }).then((r) => {return r.text()}).catch(() => {return false});
        }
        if (obj.author && obj.song) {
            html = await fetch(`https://soundcloud.com/${obj.author}/${obj.song}`, {
                headers: {"user-agent": genericUserAgent}
            }).then((r) => {return r.text()}).catch(() => {return false});
        }
        if (!html) return { error: 'ErrorCouldntFetch'};
        if (html.includes('<script>window.__sc_hydration = ') && html.includes('"format":{"protocol":"progressive","mime_type":"audio/mpeg"},') && html.includes('{"hydratable":"sound","data":')) {
            let json = JSON.parse(html.split('{"hydratable":"sound","data":')[1].split('}];</script>')[0])
            if (json["media"]["transcodings"]) {
                let clientId = await findClientID();
                if (clientId) {
                    let fileUrl = `${json.media.transcodings[0]["url"].replace("/hls", "/progressive")}?client_id=${clientId}&track_authorization=${json.track_authorization}`;
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
                } else return { error: 'ErrorSoundCloudNoClientId' }
            } else return { error: 'ErrorEmptyDownload' }
        } else return { error: ['ErrorBrokenLink', 'soundcloud'] }
    } catch (e) {
        return { error: 'ErrorBadFetch' };
    }
}
