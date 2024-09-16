import { defaultLocale } from "$lib/i18n/translations";
import type { CobaltSettings } from "$lib/types/settings";

const defaultSettings: CobaltSettings = {
    schemaVersion: 2,
    advanced: {
        debug: false,
    },
    appearance: {
        theme: "auto",
        language: defaultLocale,
        autoLanguage: true,
        reduceMotion: false,
        reduceTransparency: false,
    },
    save: {
        audioBitrate: "128",
        audioFormat: "mp3",
        disableMetadata: false,
        downloadMode: "auto",
        filenameStyle: "classic",
        savingMethod: "download",
        tiktokH265: false,
        tiktokFullAudio: false,
        twitterGif: true,
        videoQuality: "1080",
        youtubeVideoCodec: "h264",
        youtubeDubBrowserLang: false,
    },
    privacy: {
        alwaysProxy: false,
        disableAnalytics: false,
    },
    processing: {
        allowDefaultOverride: false,
        customInstanceURL: "",
        enableCustomInstances: false,
        seenOverrideWarning: false,
        seenCustomWarning: false,
    }
}

export default defaultSettings;
