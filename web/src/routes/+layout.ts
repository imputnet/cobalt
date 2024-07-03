export const prerender = true;
export const ssr = false;

import { browser } from '$app/environment';

import { get } from 'svelte/store';
import type { Load } from '@sveltejs/kit';

import languages from '$i18n/languages.json';
import { loadTranslations, defaultLocale } from '$lib/i18n/translations';

export const load: Load = async ({ url }) => {
    const { pathname } = url;

    let preferredLocale = defaultLocale;

    if (browser) {
        const device = (await import('$lib/device')).device;
        const settings = get((await import('$lib/settings')).default);
        const deviceLanguage = device.preferredLocale;
        const settingsLanguage = settings.appearance.language;

        const isValid = (lang: string) => (
            Object.keys(languages).includes(lang)
        );

        if (settings.appearance.autoLanguage) {
            if (isValid(deviceLanguage)) {
                preferredLocale = deviceLanguage;
            }
        } else if (isValid(settingsLanguage)) {
            preferredLocale = settingsLanguage
        }
    }

    await loadTranslations(preferredLocale, pathname);
    return {};
}
