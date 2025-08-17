import turnstile from "$lib/api/turnstile";
import { currentApiURL } from "$lib/api/api-url";

import type { CobaltSession, CobaltErrorResponse, CobaltSessionResponse } from "$lib/types/api";

let cache: CobaltSession | undefined;

export const requestSession = async () => {
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

    turnstile.reset();

    return response;
}

export const getSession = async () => {
    const currentTime = () => Math.floor(new Date().getTime() / 1000);

    if (cache?.token && cache?.exp - 2 > currentTime()) {
        return cache;
    }

    const newSession = await requestSession();

    if (!newSession) return {
        status: "error",
        error: {
            code: "error.api.unreachable"
        }
    } as CobaltErrorResponse

    if (!("status" in newSession)) {
        newSession.exp = currentTime() + newSession.exp;
        cache = newSession;
    }
    return newSession;
}

export const resetSession = () => cache = undefined;
