import { browser } from "$app/environment";

import { get, writable } from "svelte/store";
import { currentApiURL } from "$lib/api/api-url";

import type { CobaltServerInfoResponse, CobaltErrorResponse, CobaltServerInfo } from "$lib/types/api";

export type CobaltServerInfoCache = {
    info: CobaltServerInfo,
    origin: string,
}

export const cachedInfo = writable<CobaltServerInfoCache | undefined>();

const request = async () => {
    const apiEndpoint = `${currentApiURL()}/`;

    const response: CobaltServerInfoResponse = await fetch(apiEndpoint, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
    })
    .then(r => r.json())
    .catch((e) => {
        if (e?.message?.includes("timed out")) {
            return {
                status: "error",
                error: {
                    code: "error.api.timed_out"
                }
            } as CobaltErrorResponse
        }
    });

    return response;
}

export const getServerInfo = async () => {
    const cache = get(cachedInfo);

    if (cache && cache.origin === currentApiURL()) {
        return true
    }

    const freshInfo = await request();

    if (!freshInfo || !("cobalt" in freshInfo)) {
        return false;
    }

    if (!("status" in freshInfo)) {
        cachedInfo.set({
            info: freshInfo,
            origin: currentApiURL(),
        });

        /*
            reload the page if turnstile sitekey changed.
            there's no other proper way to do this, at least i couldn't find any :(
        */
        if (cache?.info?.cobalt?.turnstileSitekey && freshInfo?.cobalt?.turnstileSitekey) {
            if (browser) {
                window.location.reload();
            }
        }

        return true;
    }

    return false;
}
