import { get } from "svelte/store";

import settings from "$lib/state/settings";

import { getSession, resetSession } from "$lib/api/session";
import { currentApiURL } from "$lib/api/api-url";
import { turnstileEnabled, turnstileSolved } from "$lib/state/turnstile";
import cachedInfo from "$lib/state/server-info";
import { getServerInfo } from "$lib/api/server-info";

import type { Optional } from "$lib/types/generic";
import type { CobaltAPIResponse, CobaltErrorResponse, CobaltSaveRequestBody } from "$lib/types/api";

const getAuthorization = async () => {
    const processing = get(settings).processing;

    if (get(turnstileEnabled)) {
        if (!get(turnstileSolved)) {
            return {
                status: "error",
                error: {
                    code: "error.captcha_ongoing"
                }
            } as CobaltErrorResponse;
        }

        const session = await getSession();

        if (session) {
            if ("error" in session) {
                if (session.error.code !== "error.api.auth.not_configured") {
                    return session;
                }
            } else {
                return `Bearer ${session.token}`;
            }
        }
    }

    if (processing.enableCustomApiKey && processing.customApiKey.length > 0) {
        return `Api-Key ${processing.customApiKey}`;
    }
}

const request = async (requestBody: CobaltSaveRequestBody, justRetried = false) => {
    await getServerInfo();

    const getCachedInfo = get(cachedInfo);

    if (!getCachedInfo) {
        return {
            status: "error",
            error: {
                code: "error.api.unreachable"
            }
        } as CobaltErrorResponse;
    }

    const api = currentApiURL();
    const authorization = await getAuthorization();

    if (authorization && typeof authorization !== "string") {
        return authorization;
    }

    let extraHeaders = {};

    if (authorization) {
        extraHeaders = {
            "Authorization": authorization
        }
    }

    const response: Optional<CobaltAPIResponse> = await fetch(api, {
        method: "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify(requestBody),
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

    if (
        response?.status === 'error'
            && response?.error.code === 'error.api.auth.jwt.invalid'
            && !justRetried
    ) {
        resetSession();
        await waitForTurnstile().catch(() => {});
        return request(requestBody, true);
    }

    return response;
}

const waitForTurnstile = async () => {
    await getAuthorization();
    return new Promise<void>(resolve => {
        const unsub = turnstileSolved.subscribe(solved => {
            if (solved) {
                unsub();
                resolve();
            }
        });
    });
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
