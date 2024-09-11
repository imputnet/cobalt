import CobaltSessionHandler from "./internal/session";
import BaseCobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAuthError } from "./types/errors";

export default class TurnstileCobaltAPI extends BaseCobaltAPI {
    #session: CobaltSessionHandler;

    constructor(baseURL: string) {
        super(baseURL);
        this.#session = new CobaltSessionHandler(baseURL);
    }

    async request(data: CobaltRequest, turnstileResponse?: string) {
        const sessionOrError = await this.#session.getSession(turnstileResponse);
        const headers: Record<string, string> = {};

        if ("error" in sessionOrError) {
            if (sessionOrError.error.code !== CobaltAuthError.NotConfigured) {
                return sessionOrError;
            }
        } else {
            headers['Authorization'] = `Bearer ${sessionOrError.token}`;
        }

        return super._request(data, headers);
    }
}
