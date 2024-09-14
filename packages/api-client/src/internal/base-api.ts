import { CobaltResponseType, type CobaltResponse } from "../types/response";
import { CobaltReachabilityError } from "../types/errors";
import type { CobaltRequest } from "../types/request";
import { CobaltAPIClient } from "../types/interface";

export default class CobaltAPI implements CobaltAPIClient {
    #baseURL: string | undefined;

    getBaseURL() {
        return this.#baseURL;
    }

    setBaseURL(baseURL: string) {
        const url = new URL(baseURL);

        if (baseURL !== url.origin && baseURL !== `${url.origin}/`) {
            throw new Error('Invalid cobalt instance URL');
        }

        return this.#baseURL = url.origin;
    }

    async request(data: CobaltRequest, headers?: Record<string, string>) {
        const baseURL = this.getBaseURL();
        if (!baseURL) throw "baseURL is undefined";

        const response: CobaltResponse = await fetch(baseURL, {
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
