import { t as translation } from "$lib/i18n/translations";
import type { FromReadable } from "$lib/types/generic";

const languages = [
    // most popular languages are first, according to
    // https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers
    "en", "es", "pt", "fr", "ru",
    "zh", "vi", "hi", "bn", "ja",

    "af", "am", "ar", "as", "az",
    "be", "bg", "bs", "ca", "cs",
    "da", "de", "el", "et", "eu",
    "fa", "fi", "fil", "gl", "gu",
    "hr", "hu", "hy", "id", "is",
    "it", "iw", "ka", "kk", "ko",
    "km", "kn", "ky", "lo", "lt",
    "lv", "mk", "ml", "mn", "mr",
    "ms", "my", "no", "ne", "nl",
    "or", "pa", "pl", "ro", "si",
    "sk", "sl", "sq", "sr", "sv",
    "sw", "ta", "te", "th", "tr",
    "uk", "ur", "uz", "zh-Hans",
    "zh-Hant", "zh-CN", "zh-HK",
    "zh-TW", "zu"
];

export const youtubeDubLanguages = ["original", ...languages] as const;
export const subtitleLanguages = ["none", ...languages] as const;

export type YoutubeDubLang = typeof youtubeDubLanguages[number];
export type SubtitleLang = typeof subtitleLanguages[number];

type TranslationFunction = FromReadable<typeof translation>;

const namedLanguages = (
    languages: typeof youtubeDubLanguages | typeof subtitleLanguages,
    t: TranslationFunction,
) => {
    return languages.reduce((obj, lang) => {
        let name: string;

        switch (lang) {
            case "original":
                name = t("settings.youtube.dub.original");
                break;
            case "none":
                name = t("settings.subtitles.none");
                break;
            default: {
                let intlName;
                try {
                    intlName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
                } catch { /* */ };
                name = `${intlName || "unknown"} (${lang})`;
                break;
            }
        }

        return {
            ...obj,
            [lang]: name,
        };
    }, {}) as Record<typeof languages[number], string>;
}

export const namedYoutubeDubLanguages = (t: TranslationFunction) => {
    return namedLanguages(youtubeDubLanguages, t);
}

export const namedSubtitleLanguages = (t: TranslationFunction) => {
    return namedLanguages(subtitleLanguages, t);
}

export const getBrowserLanguage = (): YoutubeDubLang => {
    if (typeof navigator !== 'undefined') {
        const browserLanguage = navigator.language as YoutubeDubLang;
        if (youtubeDubLanguages.includes(browserLanguage)) {
            return browserLanguage;
        }
        const shortened = browserLanguage.split('-')[0] as YoutubeDubLang;
        if (youtubeDubLanguages.includes(shortened)) {
            return shortened;
        }
    }
    return "original";
}
