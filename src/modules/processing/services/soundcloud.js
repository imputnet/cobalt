import { env } from "../../config.js";
import { cleanString } from "../../sub/utils.js";

const cachedID = {
    version: '',
    id: ''
}

async function findClientID() {
    try {
        let sc = await fetch('https://soundcloud.com/').then(r => r.text()).catch(() => {});
        let scVersion = String(sc.match(/<script>window\.__sc_version="[0-9]{10}"<\/script>/)[0].match(/[0-9]{10}/));

        if (cachedID.version === scVersion) return cachedID.id;

        let scripts = sc.matchAll(/<script.+src="(.+)">/g);
        let clientid;
        for (let script of scripts) {
            let url = script[1];

            if (!url?.startsWith('https://a-v2.sndcdn.com/')) {
                return;
            }

            let scrf = await fetch(url).then(r => r.text()).catch(() => {});
            let id = scrf.match(/\("client_id=[A-Za-z0-9]{32}"\)/);

            if (id && typeof id[0] === 'string') {
                clientid = id[0].match(/[A-Za-z0-9]{32}/)[0];
                break;
            }
        }
        cachedID.version = scVersion;
        cachedID.id = clientid;

        return clientid;
    } catch {}
}

export default async function(obj) {
    let clientId = await findClientID();
    if (!clientId) return { error: 'ErrorSoundCloudNoClientId' };

    let link;
    if (obj.url.hostname === 'on.soundcloud.com' && obj.shortLink) {
        link = await fetch(`https://on.soundcloud.com/${obj.shortLink}/`, { redirect: "manual" }).then(r => {
            if (r.status === 302 && r.headers.get("location").startsWith("https://soundcloud.com/")) {
                return r.headers.get("location").split('?', 1)[0]
            }
        }).catch(() => {});
    }

    if (!link && obj.author && obj.song) {
        link = `https://soundcloud.com/${obj.author}/${obj.song}${obj.accessKey ? `/s-${obj.accessKey}` : ''}`
    }

    if (!link) return { error: 'ErrorCouldntFetch' };

    let json = await fetch(`https://api-v2.soundcloud.com/resolve?url=${link}&client_id=${clientId}`)
                     .then(r => r.status === 200 ? r.json() : false)
                     .catch(() => {});

    if (!json) return { error: 'ErrorCouldntFetch' };

    if (!json.media.transcodings) return { error: 'ErrorEmptyDownload' };

    let bestAudio = "opus",
        selectedStream = json.media.transcodings.find(v => v.preset === "opus_0_0"),
        mp3Media = json.media.transcodings.find(v => v.preset === "mp3_0_0");

    // use mp3 if present if user prefers it or if opus isn't available
    if (mp3Media && (obj.format === "mp3" || !selectedStream)) {
        selectedStream = mp3Media;
        bestAudio = "mp3"
    }

    let fileUrlBase = selectedStream.url;
    let fileUrl = `${fileUrlBase}${fileUrlBase.includes("?") ? "&" : "?"}client_id=${clientId}&track_authorization=${json.track_authorization}`;

    if (!fileUrl.startsWith("https://api-v2.soundcloud.com/media/soundcloud:tracks:"))
        return { error: 'ErrorEmptyDownload' };

    if (json.duration > env.durationLimit * 1000)
        return { error: ['ErrorLengthAudioConvert', env.durationLimit / 60] };

    let file = await fetch(fileUrl)
                     .then(async r => (await r.json()).url)
                     .catch(() => {});
    if (!file) return { error: 'ErrorCouldntFetch' };

    let fileMetadata = {
        title: cleanString(json.title.trim()),
        artist: cleanString(json.user.username.trim()),
    }

    return {
        urls: file,
        filenameAttributes: {
            service: "soundcloud",
            id: json.id,
            title: fileMetadata.title,
            author: fileMetadata.artist
        },
        bestAudio,
        fileMetadata
    }
}
