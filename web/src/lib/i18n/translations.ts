import i18n from 'sveltekit-i18n';

import type { Config } from 'sveltekit-i18n';
import type {
    GenericImport,
    StructuredLocfileInfo,
    LocalizationContent
} from '$lib/types/i18n';

import languages from '$i18n/languages.json';

const locFiles = import.meta.glob('$i18n/*/**/*.json');
const parsedLocfiles: StructuredLocfileInfo = {};

for (const [path, loader] of Object.entries(locFiles)) {
    const [, , lang, ...keyComponents] = path.split('/');
    const key = keyComponents.map(k => k.replace('.json', '')).join('.');
    parsedLocfiles[lang] = {
        ...parsedLocfiles[lang],
        [key]: loader as GenericImport
    };
}

const defaultLocale = 'en';
const config: Config<{
    value?: string;
    formats?: string;
    limit?: number;
    service?: string;
}> = {
    fallbackLocale: defaultLocale,
    translations: Object.keys(parsedLocfiles).reduce((obj, lang) => {
        return {
            ...obj,
            [lang]: { languages }
        }
    }, {}),
    loaders: Object.entries(parsedLocfiles).map(([lang, keys]) => {
        return Object.entries(keys).map(([key, importer]) => {
            return {
                locale: lang,
                key,
                loader: () => importer().then(
                    l => l.default as LocalizationContent
                )
            }
        });
    }).flat()
};

export { defaultLocale };
export const {
    t, loading, locales, locale: INTERNAL_locale, translations,
    loadTranslations, addTranslations, setLocale, setRoute
} = new i18n(config);
