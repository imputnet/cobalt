import { derived, readable, type Updater } from 'svelte/store';
import { browser } from '$app/environment';
import { merge } from 'ts-deepmerge';
import type {
    PartialSettings,
    AllPartialSettingsWithSchema,
    CobaltSettings
} from '../types/settings';
import { migrateOldSettings } from '../settings/migrate-v7';
import defaultSettings from '../settings/defaults';
import { migrate } from '$lib/settings/migrate';

const updatePlausiblePreference = (settings: PartialSettings) => {
    if (settings.privacy?.disableAnalytics) {
        localStorage.setItem('plausible_ignore', 'true');
    } else if (localStorage.getItem('plausible_ignore') !== null) {
        localStorage.removeItem('plausible_ignore');
    }
}

const writeToStorage = (settings: PartialSettings) => {
    localStorage.setItem(
        "settings",
        JSON.stringify(settings)
    );

    return settings;
}

const loadFromStorage = () => {
    if (!browser)
        return {};

    const settings = localStorage.getItem('settings');
    if (!settings) {
        const migrated = migrateOldSettings();
        if (migrated) {
            return writeToStorage(migrate(migrated));
        }

        return {};
    }

    return loadFromString(settings);
}

export const loadFromString = (settings: string): PartialSettings => {
    const parsed = JSON.parse(settings) as AllPartialSettingsWithSchema;
    if (parsed.schemaVersion < defaultSettings.schemaVersion) {
        return writeToStorage(migrate(parsed));
    }

    return parsed as PartialSettings;
}

let update: (_: Updater<PartialSettings>) => void;

// deep merge partial type into full CobaltSettings type
const mergeWithDefaults = (partial: PartialSettings) => {
    return merge(defaultSettings, partial) as CobaltSettings;
}

export const storedSettings = readable<PartialSettings>(
    loadFromStorage(),
    (_, _update) => { update = _update }
);

// update settings from outside
export function updateSetting(partial: PartialSettings) {
    update((current) => {
        const updated = writeToStorage(
            merge(
                current,
                partial,
                { schemaVersion: defaultSettings.schemaVersion }
            )
        );

        updatePlausiblePreference(partial);
        return updated;
    });
}

export function resetSettings() {
    update(() => {
        localStorage.removeItem('settings');
        return {};
    });
}

export default derived(
    storedSettings,
    $settings => mergeWithDefaults($settings)
);
