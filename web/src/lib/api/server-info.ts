import { get, writable } from "svelte/store";
import { currentApiURL } from "$lib/api/api-url";

import type { CobaltServerInfoResponse, CobaltErrorResponse, CobaltServerInfo } from "$lib/types/api";

export const cachedInfo = writable<CobaltServerInfo | undefined>();

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
    if (cache) return true;

    const freshInfo = await request();

    if (!freshInfo || !("cobalt" in freshInfo)) {
        return false;
    }

    if (!("status" in freshInfo)) {
        cachedInfo.set(freshInfo);
        return true;
    }

    return false;
}
