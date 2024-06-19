type CobaltSettingsAccessibility = {
    reduceAnimations: boolean,
    reduceTransparency: boolean,
};

type CobaltSettingsAppearance = {
    theme: "auto" | "light" | "dark",
};

type CobaltSettingsGeneral = {
    customProcessingEndpoint: string,
    seenOnboarding: boolean,
    seenSafetyWarning: boolean,
};

type CobaltSettingsSave = {
    audioFormat: "best" | "mp3" | "ogg" | "wav" | "opus",
    disableMetadata: boolean,
    downloadMode: "auto" | "audio" | "mute",
    downloadPopup: boolean,
    filenameStyle: "classic" | "basic" | "pretty" | "nerdy",
    tiktokH265: boolean,
    tiktokFullAudio: boolean,
    twitterGif: boolean,
    videoQuality: "max" | "2160" | "1440" | "1080" | "720" | "360" | "240" | "144",
    youtubeVideoCodec: "h264" | "av1" | "vp9",
    youtubeDubBrowserLang: boolean,
};

type CobaltSettingsPrivacy = {
    trafficAnalytics: boolean,
};

export type CobaltSettings = {
    schemaVersion: number,
    accessibility: CobaltSettingsAccessibility,
    appearance: CobaltSettingsAppearance,
    general: CobaltSettingsGeneral,
    save: CobaltSettingsSave,
    privacy: CobaltSettingsPrivacy,
};
