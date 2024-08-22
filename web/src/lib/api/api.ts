import { get } from "svelte/store";

import settings from "$lib/state/settings";
import { getSession } from "$lib/api/session";
import { currentApiURL } from "$lib/api/api-url";
import { apiOverrideWarning } from "$lib/api/override-warning";

import type { Optional } from "$lib/types/generic";
import type { CobaltAPIResponse, CobaltErrorResponse } from "$lib/types/api";

const request = async (url: string) => {
    const saveSettings = get(settings).save;

    const request = {
        url,

        downloadMode: saveSettings.downloadMode,

        audioBitrate: saveSettings.audioBitrate,
        audioFormat: saveSettings.audioFormat,
        tiktokFullAudio: saveSettings.tiktokFullAudio,
        youtubeDubBrowserLang: saveSettings.youtubeDubBrowserLang,

        youtubeVideoCodec: saveSettings.youtubeVideoCodec,
        videoQuality: saveSettings.videoQuality,

        filenameStyle: saveSettings.filenameStyle,
        disableMetadata: saveSettings.disableMetadata,

        twitterGif: saveSettings.twitterGif,
        tiktokH265: saveSettings.tiktokH265,
    }

    await apiOverrideWarning();
    const api = currentApiURL();
    const session = await getSession();

    let extraHeaders = {}

    if (session) {
        if ("error" in session) {
            if (session.error.code !== "error.api.auth.not_configured") {
                return session;
            }
        } else {
            extraHeaders = {
                "Authorization": `Bearer ${session.token}`,
            };
        }
    }

    const response: Optional<CobaltAPIResponse> = await fetch(api, {
        method: "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify(request),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...extraHeaders,
        },
    })
    .then(r => r.json())
    .catch((e) => {
        if (e?.message?.includes("timed out")) {
            return {
                status: "error",
                error: {
                    code: "error.api.timed_out"
                }
            } as CobaltErrorResponse;
        }
    });

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
