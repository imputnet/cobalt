import { type CobaltSettingsV3 } from "$lib/types/settings/v3";

export type CobaltSettingsV4 = Omit<CobaltSettingsV3, 'schemaVersion' | 'processing'> & {
    schemaVersion: 4,
    processing: Omit<CobaltSettingsV3['processing'], 'allowDefaultOverride' | 'seenOverrideWarning'> & {
        customApiKey: string;
        enableCustomApiKey: boolean;
    };
};
