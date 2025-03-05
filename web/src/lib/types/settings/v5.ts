import { type CobaltSettingsV4 } from "$lib/types/settings/v4";

export type CobaltSettingsV5 = Omit<CobaltSettingsV4, 'schemaVersion' | 'advanced' | 'save' | 'privacy' | 'appearance'> & {
    schemaVersion: 5,
    appearance: CobaltSettingsV4['appearance'] & {
        disableHaptics: boolean;
    },
    advanced: CobaltSettingsV4['advanced'] & {
        useWebCodecs: boolean;
    },
    privacy: Omit<CobaltSettingsV4['privacy'], 'alwaysProxy'>,
    save: Omit<CobaltSettingsV4['save'], 'tiktokH265' | 'twitterGif'> & {
        alwaysProxy: boolean;
        localProcessing: boolean;
        allowH265: boolean;
        convertGif: boolean;
    },
};
