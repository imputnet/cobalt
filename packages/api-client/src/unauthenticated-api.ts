import BaseCobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAPIClient } from "./types/interface";

export default class UnauthenticatedCobaltAPI extends BaseCobaltAPI implements CobaltAPIClient {
    async request(data: CobaltRequest) {
        return super.request(data, {});
    }
}
