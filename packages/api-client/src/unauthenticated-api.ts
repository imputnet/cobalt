import CobaltAPI from "./internal/base-api";
import { CobaltRequest } from "./types/request";
import { CobaltAPIClient } from "./types/interface";

export class UnauthenticatedCobaltAPI extends CobaltAPI implements CobaltAPIClient {
    async request(data: CobaltRequest) {
        return super.request(data, {});
    }
}
