import { t } from "$lib/i18n/translations";
import { get } from "svelte/store";

const languages = [
    "af", "am", "ar", "as", "az",
    "be", "bg", "bn", "bs", "ca",
    "cs", "da", "de", "el", "en",
    "es", "et", "eu", "fa", "fi",
    "fil", "fr", "gl", "gu", "hi",
    "hr", "hu", "hy", "id", "is",
    "it", "iw", "ja", "ka", "kk",
    "km", "kn", "ko", "ky", "lo",
    "lt", "lv", "mk", "ml", "mn",
    "mr", "ms", "my", "no", "ne",
    "nl", "or", "pa", "pl", "pt",
    "ro", "ru", "si", "sk", "sl",
    "sq", "sr", "sv", "sw", "ta",
    "te", "th", "tr", "uk", "ur",
    "uz", "vi", "zh", "zh-Hans", "zh-Hant",
    "zh-CN", "zh-HK", "zh-TW", "zu"
];

export const youtubeDubLanguages = ["original", ...languages] as const;
export const subtitleLanguages = ["none", ...languages] as const;

export type YoutubeDubLang = typeof youtubeDubLanguages[number];
export type SubtitleLang = typeof subtitleLanguages[number];

export const namedYoutubeLanguages = () => {
    return youtubeDubLanguages.reduce((obj, lang) => {
        const intlName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);

        let name = `${intlName} (${lang})`;
        if (lang === "original") {
            name = get(t)("settings.youtube.dub.original");
        }

        return {
            ...obj,
            [lang]: name,
        };
    }, {}) as Record<YoutubeDubLang, string>;
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
