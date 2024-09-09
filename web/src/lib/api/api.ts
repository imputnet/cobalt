import { get } from "svelte/store";

import settings from "$lib/state/settings";
import { getSession } from "$lib/api/session";
import { currentApiURL } from "$lib/api/api-url";
import { apiOverrideWarning } from "$lib/api/safety-warning";
import type { Optional } from "$lib/types/generic";
import type { CobaltAPIResponse, CobaltErrorResponse } from "$lib/types/api";
import lazySettingGetter from "$lib/settings/lazy-get";

const request = async (url: string) => {
    const getSetting = lazySettingGetter(get(settings));

    const request = {
        url,

        downloadMode: getSetting("save", "downloadMode"),
        audioBitrate: getSetting("save", "audioBitrate"),
        audioFormat: getSetting("save", "audioFormat"),
        tiktokFullAudio: getSetting("save", "tiktokFullAudio"),
        youtubeDubBrowserLang: getSetting("save", "youtubeDubBrowserLang"),

        youtubeVideoCodec: getSetting("save", "youtubeVideoCodec"),
        videoQuality: getSetting("save", "videoQuality"),

        filenameStyle: getSetting("save", "filenameStyle"),
        disableMetadata: getSetting("save", "disableMetadata"),

        twitterGif: getSetting("save", "twitterGif"),
        tiktokH265: getSetting("save", "tiktokH265"),

        alwaysProxy: getSetting("privacy", "alwaysProxy"),
    }

    await apiOverrideWarning();

    const usingCustomInstance = getSetting("processing", "enableCustomInstances")
                                && getSetting("processing", "customInstanceURL");
    const api = currentApiURL();
    // FIXME: rewrite this to allow custom instances to specify their own turnstile tokens
    const session = usingCustomInstance ? undefined : await getSession();

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

const probeCobaltTunnel = async (url: string) => {
    const request = await fetch(`${url}&p=1`).catch(() => {});
    if (request?.status === 200) {
        return request?.status;
    }
    return 0;
}

export default {
    request,
    probeCobaltTunnel,
}
