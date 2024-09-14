import { derived } from "svelte/store";

import env, { apiURL } from "$lib/env";
import settings from "$lib/state/settings";

export default derived(
    settings,
    $settings => {
        const { processing } = $settings;

        if (processing.enableCustomInstances && processing.customInstanceURL)
            return new URL(processing.customInstanceURL).origin;
        else if (env.DEFAULT_API && processing.allowDefaultOverride)
            return new URL(env.DEFAULT_API).origin;
        else
            return new URL(apiURL).origin;
    }
);
