import { get, writable } from "svelte/store";
import APIUrl from "$lib/state/api-url";

import type { CobaltServerInfoResponse, CobaltErrorResponse, CobaltServerInfo } from "$lib/types/api";

export type CobaltServerInfoCache = {
    info: CobaltServerInfo,
    origin: string,
}

export const cachedInfo = writable<CobaltServerInfoCache | undefined>();

const request = async () => {
    const apiEndpoint = `${get(APIUrl)}/`;

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

    if (cache && cache.origin === get(APIUrl)) {
        return true
    }

    const freshInfo = await request();

    if (!freshInfo || !("cobalt" in freshInfo)) {
        return false;
    }

    if (!("status" in freshInfo)) {
        cachedInfo.set({
            info: freshInfo,
            origin: get(APIUrl),
        });
        return true;
    }

    return false;
}
