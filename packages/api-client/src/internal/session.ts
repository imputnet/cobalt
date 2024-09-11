import { CobaltSession, CobaltResponseType, CobaltSessionResponse } from "../types/response";
import { CobaltReachabilityError } from "../types/errors";

const currentTime = () => Math.floor(new Date().getTime() / 1000);
const EXPIRY_THRESHOLD_SECONDS = 2;

export default class CobaltSessionHandler {
    #baseURL: string;
    #session: CobaltSession | undefined;

    constructor(baseURL: string) {
        this.#baseURL = baseURL;
    }

    async #requestSession(turnstileResponse?: string): Promise<CobaltSessionResponse> {
        const endpoint = new URL('/session', this.#baseURL);
        const headers: Record<string, string> = {};

        if (turnstileResponse) {
            headers['cf-turnstile-response'] = turnstileResponse;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            redirect: 'manual',
            signal: AbortSignal.timeout(10000),
            headers
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

        return response;
    }

    async getSession(turnstileResponse?: string): Promise<CobaltSessionResponse> {
        if (this.#session && this.#session.exp - EXPIRY_THRESHOLD_SECONDS > currentTime()) {
            return this.#session;
        }

        return this.#requestSession(turnstileResponse);
    }
};
