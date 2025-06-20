import { t } from "$lib/i18n/translations";
import { get } from "svelte/store";

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

const namedLanguages = (
    languages: typeof youtubeDubLanguages | typeof subtitleLanguages
) => {
    return languages.reduce((obj, lang) => {
        let name: string;

        switch (lang) {
            case "original":
                name = get(t)("settings.youtube.dub.original");
                break;
            case "none":
                name = get(t)("settings.subtitles.none");
                break;
            default: {
                let intlName = "unknown";
                try {
                    intlName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang) || "unknown";
                } catch { /* */ };
                name = `${intlName} (${lang})`;
                break;
            }
        }

        return {
            ...obj,
            [lang]: name,
        };
    }, {}) as Record<typeof languages[number], string>;
}

export const namedYoutubeDubLanguages = () => {
    return namedLanguages(youtubeDubLanguages);
}

export const namedSubtitleLanguages = () => {
    return namedLanguages(subtitleLanguages);
}

export const getBrowserLanguage = (): YoutubeDubLang => {
    if (typeof navigator === 'undefined')
        return "original";

    const browserLanguage = navigator.language as YoutubeDubLang;
    if (youtubeDubLanguages.includes(browserLanguage))
        return browserLanguage;

    const shortened = browserLanguage.split('-')[0] as YoutubeDubLang;
    if (youtubeDubLanguages.includes(shortened))
        return shortened;

    return "original";
}
