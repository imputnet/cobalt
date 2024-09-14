import CobaltSessionHandler from "./internal/session";
import CobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAuthError } from "./types/errors";
import type { TurnstileObject } from "turnstile-types";

export class TurnstileCobaltAPI extends CobaltAPI {
    #session: CobaltSessionHandler;
    #instanceHasTurnstile = true;

    constructor(turnstile: TurnstileObject) {
        super();
        this.#session = new CobaltSessionHandler(this, turnstile);
    }

    needsSession() {
        return this.#instanceHasTurnstile && !this.#session.hasSession();
    }

    setBaseURL(baseURL: string): string {
        if (this.#session && super.getBaseURL() !== super.setBaseURL(baseURL)) {
            this.#session.reset();
        }

        return super.getBaseURL()!;
    }

    async request(data: CobaltRequest) {
        const sessionOrError = await this.#session.getSession();
        const headers: Record<string, string> = {};

        if ("error" in sessionOrError) {
            if (sessionOrError.error.code !== CobaltAuthError.NotConfigured) {
                return sessionOrError;
            } else {
                this.#instanceHasTurnstile = false;
            }
        } else {
            headers['Authorization'] = `Bearer ${sessionOrError.token}`;
        }

        return super.request(data, headers);
    }
}
