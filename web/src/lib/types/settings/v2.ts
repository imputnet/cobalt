import languages from "$i18n/languages.json";

export const themeOptions = ["auto", "light", "dark", "cobalt"] as const;
export const audioBitrateOptions = ["320", "256", "128", "96", "64", "8"] as const;
export const audioFormatOptions = ["best", "mp3", "ogg", "wav", "opus"] as const;
export const downloadModeOptions = ["auto", "audio", "mute"] as const;
export const filenameStyleOptions = ["classic", "basic", "pretty", "nerdy"] as const;
export const videoQualityOptions = ["max", "2160", "1440", "1080", "720", "480", "360", "240", "144"] as const;
export const youtubeVideoCodecOptions = ["h264", "av1", "vp9"] as const;
export const savingMethodOptions = ["ask", "download", "share", "copy"] as const;

type CobaltSettingsAppearance = {
    theme: typeof themeOptions[number],
    language: keyof typeof languages,
    autoLanguage: boolean,
    reduceMotion: boolean,
    reduceTransparency: boolean,
};

type CobaltSettingsAdvanced = {
    debug: boolean,
};

type CobaltSettingsPrivacy = {
    alwaysProxy: boolean,
    disableAnalytics: boolean,
};

type CobaltSettingsProcessing = {
    allowDefaultOverride: boolean,
    customInstanceURL: string,
    enableCustomInstances: boolean,
    seenCustomWarning: boolean,
    seenOverrideWarning: boolean,
}

type CobaltSettingsSaveV2 = {
    audioFormat: typeof audioFormatOptions[number],
    audioBitrate: typeof audioBitrateOptions[number],
    disableMetadata: boolean,
    downloadMode: typeof downloadModeOptions[number],
    filenameStyle: typeof filenameStyleOptions[number],
    savingMethod: typeof savingMethodOptions[number],
    tiktokH265: boolean,
    tiktokFullAudio: boolean,
    twitterGif: boolean,
    videoQuality: typeof videoQualityOptions[number],
    youtubeVideoCodec: typeof youtubeVideoCodecOptions[number],
    youtubeDubBrowserLang: boolean,
    youtubeHLS: boolean,
};

export type CobaltSettingsV2 = {
    schemaVersion: 2,
    advanced: CobaltSettingsAdvanced,
    appearance: CobaltSettingsAppearance,
    save: CobaltSettingsSaveV2,
    privacy: CobaltSettingsPrivacy,
    processing: CobaltSettingsProcessing,
};
