import { derived } from 'svelte/store';

import languages from '$i18n/languages.json';

import settings from '$lib/state/settings';
import { device } from '$lib/device';
import { INTERNAL_locale, defaultLocale } from '$lib/i18n/translations';

const isValid = (lang: string) => (
    Object.keys(languages).includes(lang)
);

export default derived(
    settings,
    ($settings) => {
        let currentLocale = defaultLocale;

        if ($settings.appearance.autoLanguage) {
            if (isValid(device.prefers.language)) {
                currentLocale = device.prefers.language;
            }
        } else {
            if (isValid($settings.appearance.language)) {
                currentLocale = $settings.appearance.language;
            }
        }

        INTERNAL_locale.set(currentLocale);
        return currentLocale;
    }
);
