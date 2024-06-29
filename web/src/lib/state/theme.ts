import { readable, derived } from 'svelte/store';

import settings from '$lib/settings';
import { themeOptions } from '$lib/types/settings';

let set: (_: typeof themeOptions[number]) => void;

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
);

