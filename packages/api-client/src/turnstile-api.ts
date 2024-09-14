import CobaltSessionHandler from "./internal/session";
import BaseCobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAuthError } from "./types/errors";
import { CobaltAPIClient } from "./types/interface";
import type { TurnstileObject } from "turnstile-types";

export default class TurnstileCobaltAPI extends BaseCobaltAPI implements CobaltAPIClient {
    #session: CobaltSessionHandler;
    #instanceHasTurnstile = true;

    constructor(baseURL: string, turnstile: TurnstileObject) {
        super(baseURL);
        this.#session = new CobaltSessionHandler(baseURL, turnstile);
    }

    needsSession() {
        return this.#instanceHasTurnstile && !this.#session.hasSession();
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
