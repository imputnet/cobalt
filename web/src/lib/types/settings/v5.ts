import { type CobaltSettingsV4 } from "$lib/types/settings/v4";

export type CobaltSettingsV5 = Omit<CobaltSettingsV4, 'schemaVersion' | 'advanced'> & {
    schemaVersion: 5,
    advanced: CobaltSettingsV4['advanced'] & {
        localProcessing: boolean;
    };
};
