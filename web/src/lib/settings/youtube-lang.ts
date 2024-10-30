export const youtubeLanguages = [
    "original",
    "af",
    "am",
    "ar",
    "as",
    "az",
    "be",
    "bg",
    "bn",
    "bs",
    "ca",
    "cs",
    "da",
    "de",
    "el",
    "en",
    "es",
    "et",
    "eu",
    "fa",
    "fi",
    "fil",
    "fr",
    "gl",
    "gu",
    "hi",
    "hr",
    "hu",
    "hy",
    "id",
    "is",
    "it",
    "iw",
    "ja",
    "ka",
    "kk",
    "km",
    "kn",
    "ko",
    "ky",
    "lo",
    "lt",
    "lv",
    "mk",
    "ml",
    "mn",
    "mr",
    "ms",
    "my",
    "no",
    "ne",
    "nl",
    "or",
    "pa",
    "pl",
    "pt",
    "ro",
    "ru",
    "si",
    "sk",
    "sl",
    "sq",
    "sr",
    "sv",
    "sw",
    "ta",
    "te",
    "th",
    "tr",
    "uk",
    "ur",
    "uz",
    "vi",
    "zh-CN",
    "zh-HK",
    "zh-TW",
    "zu"
] as const;

export type YoutubeLang = typeof youtubeLanguages[number];

export const namedYoutubeLanguages = () => {
    return youtubeLanguages.reduce((obj, lang) => {
        const intlName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);

        let name = `${intlName} (${lang})`;
        if (lang === "original") {
            name = lang;
        }

        return {
            ...obj,
            [lang]: name,
        };
    }, {}) as Record<YoutubeLang, string>;
}

export const getBrowserLanguage = (): YoutubeLang => {
    if (typeof navigator === 'undefined')
        return "original";

    const browserLanguage = navigator.language as YoutubeLang;
    if (youtubeLanguages.includes(browserLanguage))
        return browserLanguage;

    const shortened = browserLanguage.split('-')[0] as YoutubeLang;
    if (youtubeLanguages.includes(shortened))
        return shortened;

    return "original";
}
