import { readable, type Updater } from 'svelte/store';
import { merge } from 'ts-deepmerge';

import type { RecursivePartial } from './types/generic';
import type { CobaltSettings } from './types/settings';

import defaultSettings from "$lib/settings/defaults";

const writeToStorage = (settings: CobaltSettings) => {
    localStorage.setItem(
        "settings",
        JSON.stringify(settings)
    );

    return settings;
}

const loadFromStorage = () => {
    const settings = localStorage.getItem('settings');
    if (!settings) {
        return defaultSettings;
    }

    return JSON.parse(settings) as CobaltSettings;
}

let update: (_: Updater<CobaltSettings>) => void;

export default readable<CobaltSettings>(
    loadFromStorage(),
    (_, _update) => { update = _update }
);

// update settings from outside
export function updateSetting(settings: RecursivePartial<CobaltSettings>) {
    update((current) => {
        // deep merge partial type into full CobaltSettings type
        current = merge(current, settings) as CobaltSettings;

        return writeToStorage(current);
    });
}
