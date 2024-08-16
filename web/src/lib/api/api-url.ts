import { get } from "svelte/store";

import env, { apiURL } from "$lib/env";
import settings from "$lib/state/settings";

export const currentApiURL = () => {
    if (env.DEFAULT_API && get(settings).processing.allowDefaultOverride) {
        return env.DEFAULT_API;
    }
    return apiURL;
}
