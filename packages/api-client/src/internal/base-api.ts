import { CobaltResponseType, type CobaltResponse } from "../types/response";
import { CobaltReachabilityError } from "../types/errors";
import type { CobaltRequest } from "../types/request";

export default class BaseCobaltAPI {
    #baseURL: string;
    #userAgent: string | undefined;

    constructor(baseURL: string, userAgent?: string) {
        const url = new URL(baseURL);

        if (baseURL !== url.origin && baseURL !== `${url.origin}/`) {
            throw new Error('Invalid cobalt instance URL');
        }

        this.#baseURL = url.origin;
        this.#userAgent = userAgent;
    }

    protected async _request(data: CobaltRequest, headers: Record<string, string>) {
        if (this.#userAgent) {
            headers['user-agent'] = this.#userAgent;
        }

        const response: CobaltResponse = await fetch(this.#baseURL, {
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
