import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';

import languages from '$i18n/languages.json';

export const defaultLocale = 'en';

export const config: Config = {
    translations: {
        en: { languages },
        ru: { languages },
    },
    loaders: [
        {
            locale: 'en',
            key: 'tabs',
            loader: async () => (
                await import(`$i18n/en/tabs.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'a11y.tabs',
            loader: async () => (
                await import(`$i18n/en/a11y/tabs.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'save',
            loader: async () => (
                await import(`$i18n/en/save.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'a11y.save',
            loader: async () => (
                await import(`$i18n/en/a11y/save.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'a11y.meowbalt',
            loader: async () => (
                await import(`$i18n/en/a11y/meowbalt.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'settings',
            loader: async () => (
                await import(`$i18n/en/settings.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'general',
            loader: async () => (
                await import(`$i18n/en/general.json`)
            ).default,
        },
        {
            locale: 'en',
            key: 'a11y.general',
            loader: async () => (
                await import(`$i18n/en/a11y/general.json`)
            ).default,
        },

        {
            locale: 'ru',
            key: 'tabs',
            loader: async () => (
                await import(`$i18n/ru/tabs.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'a11y.tabs',
            loader: async () => (
                await import(`$i18n/ru/a11y/tabs.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'save',
            loader: async () => (
                await import(`$i18n/ru/save.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'a11y.save',
            loader: async () => (
                await import(`$i18n/ru/a11y/save.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'a11y.meowbalt',
            loader: async () => (
                await import(`$i18n/ru/a11y/meowbalt.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'general',
            loader: async () => (
                await import(`$i18n/ru/general.json`)
            ).default,
        },
        {
            locale: 'ru',
            key: 'a11y.general',
            loader: async () => (
                await import(`$i18n/ru/a11y/general.json`)
            ).default,
        },
    ],
};

export const {
    t, loading, locales, locale, translations,
    loadTranslations, addTranslations, setLocale, setRoute
} = new i18n(config);
