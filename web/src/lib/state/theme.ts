import { readable, derived, type Readable } from 'svelte/store';

import settings from '$lib/state/settings';
import { themeOptions } from '$lib/types/settings';

type Theme = typeof themeOptions[number];

let set: (_: Theme) => void;

const browserPreference = () =>
    window.matchMedia('(prefers-color-scheme: light)')
        .matches ? 'light' : 'dark';

const browserPreferenceReadable = readable(
    browserPreference(),
    _set => { set = _set }
)

const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

if (matchMedia.addEventListener) {
    matchMedia.addEventListener('change', () => set(browserPreference()));
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
