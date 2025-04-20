import env from "$lib/env";
import { get } from "svelte/store";
import settings from "$lib/state/settings";

export const currentApiURL = () => {
    const processingSettings = get(settings).processing;
    const customInstanceURL = processingSettings.customInstanceURL;

    if (processingSettings.enableCustomInstances && customInstanceURL.length > 0) {
        return new URL(customInstanceURL).origin;
    }

    return new URL(env.DEFAULT_API!).origin;
}
