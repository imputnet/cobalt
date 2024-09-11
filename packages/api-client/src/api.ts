import { CobaltResponseType, type CobaltAPIResponse } from "./types/response";
import type { CobaltRequest } from "./types/request";
import { CobaltReachabilityError } from "./types/errors";

export default class CobaltAPI {
    #baseURL: string;

    constructor(baseURL: string) {
        const url = new URL(baseURL);

        if (baseURL !== url.origin && baseURL !== `${url.origin}/`) {
            throw new Error('Invalid cobalt instance URL');
        }

        this.#baseURL = url.origin;
    }

    async request(data: CobaltRequest, headers: Record<string, string>) {
        const response: CobaltAPIResponse = await fetch(this.#baseURL, {
            method: 'POST',
            redirect: 'manual',
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...headers
            }
        })
        .then(r => r.json())
        .catch((e) => {
            const timedOut = e?.message?.includes("timed out");
            return {
                status: CobaltResponseType.Error,
                error: {
                    code: timedOut
                            ? CobaltReachabilityError.TimedOut
                            : CobaltReachabilityError.Unreachable
                }
            };
        });

        return response;
    }
};
