import { get } from 'svelte/store';
import settings from "$lib/state/settings";
import type { CobaltAPIResponse } from "$lib/types/api";

const apiURL = "https://api.cobalt.tools";

const request = async (url: string) => {
    const saveSettings = get(settings).save;

    const request = {
        url,

        isAudioOnly: saveSettings.downloadMode === "audio",
        isAudioMuted: saveSettings.downloadMode === "mute",
        aFormat: saveSettings.audioFormat,
        isTTFullAudio: saveSettings.tiktokFullAudio,
        dubLang: saveSettings.youtubeDubBrowserLang,

        vCodec: saveSettings.youtubeVideoCodec,
        vQuality: saveSettings.videoQuality,

        filenamePattern: saveSettings.filenameStyle,
        disableMetadata: saveSettings.disableMetadata,

        twitterGif: saveSettings.twitterGif,
        tiktokH265: saveSettings.tiktokH265,
    }

    const response: CobaltAPIResponse | undefined = await fetch(`${apiURL}/api/json`, {
        method: "POST",
        redirect: "manual",
        body: JSON.stringify(request),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).catch(() => {});

    return response;
}

const probeCobaltStream = async (url: string) => {
    const request = await fetch(`${url}&p=1`).catch(() => {});
    if (request?.status === 200) {
        return request?.status;
    }
    return 0;
}

export default {
    request,
    probeCobaltStream,
}
