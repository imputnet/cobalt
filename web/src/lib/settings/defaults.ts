import { browser } from "$app/environment";
import { defaultLocale } from "$lib/i18n/translations";
import type { CobaltSettings } from "$lib/types/settings";

const defaultSettings: CobaltSettings = {
    schemaVersion: 1,
    accessibility: {
        reduceAnimations: false,
        reduceTransparency: false,
    },
    appearance: {
        theme: "auto",
        language: defaultLocale,
        autoLanguage: true,
    },
    general: {
        customProcessingEndpoint: "",
        seenOnboarding: false,
        seenSafetyWarning: false,
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
        youtubeDubBrowserLang: false,
    },
    privacy: {
        trafficAnalytics: true,
    },
}

const defaultSettingsPage = () => {
    if (browser) {
        if (window.innerWidth <= 750) {
            return "/settings";
        }
    }

    return "/settings/general/appearance";
}

export default defaultSettings;
export { defaultSettingsPage };