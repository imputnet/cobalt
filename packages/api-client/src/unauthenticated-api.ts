import BaseCobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAPIClient } from "./types/interface";

export default class UnauthenticatedCobaltAPI extends BaseCobaltAPI implements CobaltAPIClient {
    constructor(baseURL: string, userAgent?: string) {
        super(baseURL, userAgent);
    }

    async request(data: CobaltRequest) {
        return super._request(data, {});
    }
}
