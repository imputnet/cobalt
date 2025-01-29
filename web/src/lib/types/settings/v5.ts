import { type CobaltSettingsV4 } from "$lib/types/settings/v4";

export type CobaltSettingsV5 = Omit<CobaltSettingsV4, 'schemaVersion' | 'advanced' | 'save'> & {
    schemaVersion: 5,
    advanced: CobaltSettingsV4['advanced'] & {
        localProcessing: boolean;
    },
    save: Omit<CobaltSettingsV4['save'], 'tiktokH265' | 'twitterGif'> & {
        allowH265: boolean;
        convertGif: boolean;
    },
};
