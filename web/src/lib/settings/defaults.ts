import type { CobaltSettings } from "$lib/types/settings";

const defaultSettings: CobaltSettings = {
    schemaVersion: 1,
    accessibility: {
        reduceAnimations: false,
        reduceTransparency: false
    },
    appearance: {
        theme: "auto"
    },
    general: {
        customProcessingEndpoint: "",
        seenOnboarding: false,
        seenSafetyWarning: false
    },
    save: {
        audioFormat: "mp3",
        disableMetadata: false,
        downloadMode: "auto",
        downloadPopup: true,
        filenameStyle: "classic",
        tiktokH265: false,
        tiktokFullAudio: false,
        twitterGif: false,
        videoQuality: "720",
        youtubeVideoCodec: "h264",
        youtubeDubBrowserLang: false
    },
    privacy: {
        trafficAnalytics: true
    }
}
export default defaultSettings;

export const settingArrays = {
    appearance: {
        theme: ["auto", "light", "dark"]
    },
    save: {
        audioFormat: ["best", "mp3", "ogg", "wav", "opus"],
        filenameStyle: ["classic", "basic", "pretty", "nerdy"],
        videoQuality: ["max", "2160", "1440", "1080", "720", "480", "360", "240", "144"],
        youtubeVideoCodec: ["h264", "av1", "vp9"],
    },
}
