import { get } from "svelte/store";

import turnstile from "$lib/api/turnstile";
import { currentApiURL } from "$lib/api/api-url";
import { cachedSession } from "$lib/state/session";

import type { CobaltSessionResponse, CobaltErrorResponse } from "$lib/types/api";

export const requestSession = async() => {
    const apiEndpoint = `${currentApiURL()}/session`;

    let requestHeaders = {};

    const turnstileResponse = turnstile.getResponse();
    if (turnstileResponse) {
        requestHeaders = {
            "cf-turnstile-response": turnstileResponse
        };
    }

    const response: CobaltSessionResponse = await fetch(apiEndpoint, {
        method: "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        headers: requestHeaders,
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

    turnstile.update();

    return response;
}

export const getSession = async () => {
    const currentTime = new Date().getTime();
    const cache = get(cachedSession);

    if (cache?.token && cache?.exp > currentTime) {
        return cache;
    }

    const newSession = await requestSession();

    if (!newSession) return {
        status: "error",
        error: {
            code: "error.api.generic"
        }
    } as CobaltErrorResponse

    if (!("status" in newSession)) {
        cachedSession.set(newSession);
    }
    return newSession;
}
