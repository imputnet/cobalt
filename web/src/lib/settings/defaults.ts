import { device } from "$lib/device";
import { defaultLocale } from "$lib/i18n/translations";
import type { CobaltSettings } from "$lib/types/settings";

const defaultSettings: CobaltSettings = {
    schemaVersion: 5,
    advanced: {
        debug: false,
        useWebCodecs: false,
    },
    appearance: {
        theme: "auto",
        language: defaultLocale,
        autoLanguage: true,
        hideRemuxTab: false,
    },
    accessibility: {
        reduceMotion: false,
        reduceTransparency: false,
        disableHaptics: false,
        dontAutoOpenQueue: false,
    },
    save: {
        alwaysProxy: false,
        localProcessing: device.supports.defaultLocalProcessing || false,
        audioBitrate: "128",
        audioFormat: "mp3",
        disableMetadata: false,
        downloadMode: "auto",
        filenameStyle: "basic",
        savingMethod: "download",
        allowH265: false,
        tiktokFullAudio: false,
        convertGif: true,
        videoQuality: "1080",
        youtubeVideoCodec: "h264",
        youtubeDubLang: "original",
        youtubeHLS: false,
        youtubeBetterAudio: false,
    },
    privacy: {
        disableAnalytics: false,
    },
    processing: {
        customInstanceURL: "",
        customApiKey: "",
        enableCustomInstances: false,
        enableCustomApiKey: false,
        seenCustomWarning: false,
    }
}

export default defaultSettings;
