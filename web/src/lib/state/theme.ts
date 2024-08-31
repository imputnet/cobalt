import { readable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

import settings from '$lib/state/settings';
import { themeOptions } from '$lib/types/settings';

type Theme = typeof themeOptions[number];

let set: (_: Theme) => void;

const browserPreference = () => {
    if (!browser || window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }

    return 'dark'
}

const browserPreferenceReadable = readable(
    browserPreference(),
    _set => { set = _set }
)

if (browser) {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

    if (matchMedia.addEventListener) {
        matchMedia.addEventListener('change', () => set(browserPreference()));
    }
}

export default derived(
    [settings, browserPreferenceReadable],
    ([$settings, $browserPref]) => {
        if ($settings.appearance.theme !== 'auto') {
            return $settings.appearance.theme;
        }

        return $browserPref;
    },
    browserPreference()
) as Readable<Exclude<Theme, "auto">>

export const statusBarColors = {
    "dark": "#000000",
    "light": "#ffffff"
}
