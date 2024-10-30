import type { AllPartialSettingsWithSchema } from "$lib/types/settings";

const oldSwitcherValues = {
    theme: ['auto', 'light', 'dark'],
    vCodec: ['h264', 'av1', 'vp9'],
    vQuality: ['720', 'max', '2160', '1440', '1080', '480', '360', '240', '144'],
    aFormat: ['mp3', 'best', 'ogg', 'wav', 'opus'],
    filenamePattern: ['classic', 'pretty', 'basic', 'nerdy']
} as const;

const oldCheckboxes = [
    'audioMode',
    'fullTikTokAudio',
    'muteAudio',
    'reduceTransparency',
    'disableAnimations',
    'disableMetadata',
    'plausible_ignore',
    'ytDub',
    'tiktokH265'
] as const;

type LegacySwitchers = keyof typeof oldSwitcherValues;
type LegacyCheckboxes = typeof oldCheckboxes[number];

const _get = (name: LegacyCheckboxes | LegacySwitchers) => {
    const value = localStorage.getItem(name);
    if (value !== null) {
        return value;
    }
}

const getBool = (name: LegacyCheckboxes) => {
    const value = _get(name);

    if (value !== undefined) {
        return value === 'true';
    }
}

const getLiteral = <T extends LegacySwitchers>(name: T) => {
    const value = _get(name);
    if (value === undefined) {
        return;
    }

    const values = oldSwitcherValues[name] as readonly string[];
    if (values.includes(value)) {
        type SwitcherOptions = typeof oldSwitcherValues[T][number];
        return value as SwitcherOptions;
    }
}

const getDownloadMode = () => {
    if (getBool('muteAudio')) {
        return 'mute';
    }

    if (getBool('audioMode')) {
        return 'audio';
    }

    return 'auto';
}

const cleanup = () => {
    for (const key of Object.keys(localStorage)) {
        // plausible script needs this value, so we keep it if migrating
        if (key !== 'plausible_ignore') {
            localStorage.removeItem(key);
        }
    }
}

export const migrateOldSettings = () => {
    if (getLiteral('vCodec') === undefined) {
        /* on the old frontend, preferences such as "vCodec" are set right
         * when you open it. so, if this preference does not exist, we can
         * assume that the user never used the old frontend, and abort the
         * migration early. */
        return;
    }

    const migrated: AllPartialSettingsWithSchema = {
        schemaVersion: 2,
        appearance: {
            theme: getLiteral('theme'),
            reduceTransparency: getBool('reduceTransparency'),
            reduceMotion: getBool('disableAnimations'),
        },
        privacy: {
            disableAnalytics: getBool('plausible_ignore')
        },
        save: {
            youtubeVideoCodec: getLiteral('vCodec'),
            videoQuality: getLiteral('vQuality'),
            audioFormat: getLiteral('aFormat'),
            downloadMode: getDownloadMode(),
            filenameStyle: getLiteral('filenamePattern'),
            tiktokFullAudio: getBool('fullTikTokAudio'),
            tiktokH265: getBool('tiktokH265'),
            disableMetadata: getBool('disableMetadata'),
            youtubeDubBrowserLang: getBool('ytDub'),
        }
    };

    cleanup();
    return migrated;
}
