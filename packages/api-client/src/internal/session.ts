import { CobaltSession, CobaltResponseType, CobaltSessionResponse } from "../types/response";
import { CobaltReachabilityError } from "../types/errors";
import type { TurnstileObject } from "turnstile-types";
import { CobaltAPIClient } from "../types/interface";

const currentTime = () => Math.floor(new Date().getTime() / 1000);
const EXPIRY_THRESHOLD_SECONDS = 2;

export default class CobaltSessionHandler {
    #client: CobaltAPIClient;
    #turnstile: TurnstileObject;
    #session: CobaltSession | undefined;

    constructor(client: CobaltAPIClient, turnstile: TurnstileObject) {
        this.#client = client;
        this.#turnstile = turnstile;
    }

    async #requestSession(): Promise<CobaltSessionResponse> {
        const baseURL = this.#client.getBaseURL();
        if (!baseURL) throw "baseURL is undefined";

        const endpoint = new URL('/session', baseURL);
        const response = await fetch(endpoint, {
            method: 'POST',
            redirect: 'manual',
            signal: AbortSignal.timeout(10000),
            headers: {
                'cf-turnstile-response': this.#turnstile.getResponse('#turnstile-widget')
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

        if ('token' in response && 'exp' in response) {
            this.#session = {
                token: response.token,
                exp: currentTime() + response.exp
            }
        }

        this.#turnstile.reset('#turnstile-widget');

        return response;
    }

    hasSession() {
        return this.#session && this.#session.exp - EXPIRY_THRESHOLD_SECONDS > currentTime();
    }

    reset() {
        this.#session = undefined;
    }

    async getSession(): Promise<CobaltSessionResponse> {
        if (this.hasSession()) {
            return this.#session!;
        }

        return this.#requestSession();
    }
};
