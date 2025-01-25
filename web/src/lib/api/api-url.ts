import { get } from "svelte/store";
import settings from "$lib/state/settings";
import env, { defaultApiURL } from "$lib/env";

export const currentApiURL = () => {
    const processingSettings = get(settings).processing;
    const customInstanceURL = processingSettings.customInstanceURL;

    if (processingSettings.enableCustomInstances && customInstanceURL.length > 0) {
        return new URL(customInstanceURL).origin;
    }

    if (env.DEFAULT_API) {
        return new URL(env.DEFAULT_API).origin;
    }

    return new URL(defaultApiURL).origin;
}
