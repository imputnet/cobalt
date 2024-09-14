import { CobaltSession, CobaltResponseType, CobaltSessionResponse } from "../types/response";
import { CobaltReachabilityError } from "../types/errors";
import type { TurnstileObject } from "turnstile-types";

const currentTime = () => Math.floor(new Date().getTime() / 1000);
const EXPIRY_THRESHOLD_SECONDS = 2;

export default class CobaltSessionHandler {
    #baseURL: string;
    #turnstile: TurnstileObject;
    #session: CobaltSession | undefined;

    constructor(baseURL: string, turnstile: TurnstileObject) {
        this.#baseURL = baseURL;
        this.#turnstile = turnstile;
    }

    async #requestSession(): Promise<CobaltSessionResponse> {
        const endpoint = new URL('/session', this.#baseURL);

        const response = await fetch(endpoint, {
            method: 'POST',
            redirect: 'manual',
            signal: AbortSignal.timeout(10000),
            headers: {
                'cf-turnstile-response': this.#turnstile.getResponse('turnstile-widget')
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

        this.#turnstile.reset('turnstile-widget');

        return response;
    }

    hasSession() {
        return this.#session && this.#session.exp - EXPIRY_THRESHOLD_SECONDS > currentTime();
    }

    async getSession(): Promise<CobaltSessionResponse> {
        if (this.hasSession()) {
            return this.#session!;
        }

        return this.#requestSession();
    }
};
