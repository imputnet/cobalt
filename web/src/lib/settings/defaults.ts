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
