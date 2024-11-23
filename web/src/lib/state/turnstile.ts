import settings from "$lib/state/settings";
import cachedInfo from "$lib/state/server-info";
import { derived, writable } from "svelte/store";

export const turnstileSolved = writable(false);
export const turnstileCreated = writable(false);

export const turnstileEnabled = derived(
    [settings, cachedInfo],
    ([$settings, $cachedInfo]) => {
        return !!$cachedInfo?.info?.cobalt?.turnstileSitekey &&
            !(
                $settings.processing.enableCustomApiKey &&
                $settings.processing.customApiKey.length > 0
            )
    }
)
