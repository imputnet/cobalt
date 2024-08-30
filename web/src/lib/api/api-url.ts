import { get } from "svelte/store";

import env, { apiURL } from "$lib/env";
import settings from "$lib/state/settings";

export const currentApiURL = () => {
    const processingSettings = get(settings).processing;
    const customInstanceURL = processingSettings.customInstanceURL;

    if (processingSettings.enableCustomInstances && customInstanceURL.length > 0) {
        return new URL(customInstanceURL).origin;
    }

    if (env.DEFAULT_API && processingSettings.allowDefaultOverride) {
        return new URL(env.DEFAULT_API).origin;
    }

    return new URL(apiURL).origin;
}
