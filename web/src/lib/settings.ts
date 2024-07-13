import { readable, type Updater } from 'svelte/store';
import { merge } from 'ts-deepmerge';

import type { RecursivePartial } from './types/generic';
import type { CobaltSettings } from './types/settings';

import defaultSettings from './settings/defaults';

type PartialSettings = RecursivePartial<CobaltSettings>;
type PartialSettingsWithSchema = RecursivePartial<CobaltSettings> & { schemaVersion: number };

const writeToStorage = (settings: PartialSettings) => {
    localStorage.setItem(
        "settings",
        JSON.stringify({
            schemaVersion: defaultSettings.schemaVersion,
            ...settings
        })
    );

    return settings;
}

type Migrator = (s: PartialSettings) => PartialSettings;
const migrations: Record<number, Migrator> = {

}

const migrate = (settings: PartialSettingsWithSchema) => {
    return Object.keys(migrations)
        .map(Number)
        .filter(version => version > settings.schemaVersion)
        .reduce((settings, migrationVersion) => {
            return migrations[migrationVersion](settings);
        }, settings as PartialSettings);
}

const loadFromStorage = () => {
    const settings = localStorage.getItem('settings');
    if (!settings) {
        return {};
    }

    const parsed = JSON.parse(settings) as PartialSettingsWithSchema;
    if (parsed.schemaVersion < defaultSettings.schemaVersion) {
        return migrate(parsed);
    }

    return parsed;
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
