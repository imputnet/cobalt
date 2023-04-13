import { maxVideoDuration } from "../../config.js";

let cachedID = {};

async function findClientID() {
    try {
        let sc = await fetch('https://soundcloud.com/').then((r) => { return r.text() }).catch(() => { return false });
        let scVersion = String(sc.match(/<script>window\.__sc_version="[0-9]{10}"<\/script>/)[0].match(/[0-9]{10}/));

        if (cachedID.version === scVersion) return cachedID.id;
        
        let scripts = sc.matchAll(/<script.+src="(.+)">/g);
        let clientid;
        for (let script of scripts) {
            let url = script[1];
    
            if (url && !url.startsWith('https://a-v2.sndcdn.com')) return;
    
            let scrf = await fetch(url).then((r) => {return r.text()}).catch(() => { return false });
            let id = scrf.match(/\("client_id=[A-Za-z0-9]{32}"\)/);
    
            if (id && typeof id[0] === 'string') {
                clientid = id[0].match(/[A-Za-z0-9]{32}/)[0];
                break;
            }
        }
        cachedID.version = scVersion;
        cachedID.id = clientid;

        return clientid;
    } catch (e) {
        return false;
    }
}

export default async function(obj) {
    let html;
    if (!obj.author && !obj.song && obj.shortLink) {
        html = await fetch(`https://soundcloud.app.goo.gl/${obj.shortLink}/`).then((r) => { return r.text() }).catch(() => { return false });
    }
    if (obj.author && obj.song) {
        html = await fetch(`https://soundcloud.com/${obj.author}/${obj.song}${obj.accessKey ? `/s-${obj.accessKey}` : ''}`).then((r) => { return r.text() }).catch(() => { return false });
    }
    if (!html) return { error: 'ErrorCouldntFetch'};
    if (!(html.includes('<script>window.__sc_hydration = ')
    && html.includes('"format":{"protocol":"progressive","mime_type":"audio/mpeg"},')
    && html.includes('{"hydratable":"sound","data":'))) {
        return { error: ['ErrorBrokenLink', 'soundcloud'] }
    }

    let json = JSON.parse(html.split('{"hydratable":"sound","data":')[1].split('}];</script>')[0])
    if (!json["media"]["transcodings"]) return { error: 'ErrorEmptyDownload' };

    let clientId = await findClientID();
    if (!clientId) return { error: 'ErrorSoundCloudNoClientId' };

    const audioFilename = `soundcloud_${json.id}`;
    const fileMetadata = {
        title: json.title,
        artist: json.user.username,
    };

    if (json.downloadable) {
        const downloadUrl = 'https://api-v2.soundcloud.com/tracks/' + json.id + '/download?client_id=' + clientId;
        const redirectUri = await fetch(downloadUrl).then(async (r) => { return (await r.json()).redirectUri })
            .catch(() => { return false });
        if (redirectUri)
            return {
                urls: redirectUri,
                audioFilename,
                fileMetadata
            };
    }

    let fileUrlBase = json.media.transcodings[0]["url"].replace("/hls", "/progressive"),
        fileUrl = `${fileUrlBase}${fileUrlBase.includes("?") ? "&" : "?"}client_id=${clientId}&track_authorization=${json.track_authorization}`;
    if (fileUrl.substring(0, 54) !== "https://api-v2.soundcloud.com/media/soundcloud:tracks:") return { error: 'ErrorEmptyDownload' };

    if (json.duration > maxVideoDuration) return { error: ['ErrorLengthAudioConvert', maxVideoDuration / 60000] };

    let file = await fetch(fileUrl).then(async (r) => { return (await r.json()).url }).catch(() => { return false });
    if (!file) return { error: 'ErrorCouldntFetch' };

    return {
        urls: file,
        audioFilename,
        fileMetadata
    }
}
