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
    
    // 确保 apiURL 有值，否则使用硬编码的默认值
    const finalApiURL = apiURL || "https://api.freesavevideo.online/";
    
    return new URL(finalApiURL).origin;
}
