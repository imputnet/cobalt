import { readable, type Updater } from 'svelte/store';
import { merge } from 'ts-deepmerge';

import type { RecursivePartial } from './types/generic';
import type { CobaltSettings } from './types/settings';

import defaultSettings from './settings/defaults';

type PartialSettings = RecursivePartial<CobaltSettings>;

const writeToStorage = (settings: PartialSettings) => {
    localStorage.setItem(
        "settings",
        JSON.stringify(settings)
    );

    return settings;
}

const loadFromStorage = () => {
    const settings = localStorage.getItem('settings');
    if (!settings) {
        return {};
    }

    return JSON.parse(settings) as PartialSettings;
}

let update: (_: Updater<CobaltSettings>) => void;

// deep merge partial type into full CobaltSettings type
const mergeWithDefaults = (partial: PartialSettings) => {
    return merge(defaultSettings, partial) as CobaltSettings;
}

export default readable<CobaltSettings>(
    mergeWithDefaults(loadFromStorage()),
    (_, _update) => { update = _update }
);

// update settings from outside
export function updateSetting(partial: PartialSettings) {
    update(() => {
        const updated = writeToStorage(
            merge(loadFromStorage(), partial)
        );

        return mergeWithDefaults(updated);
    });
}
