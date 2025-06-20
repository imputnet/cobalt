import type { YoutubeDubLang } from "$lib/settings/audio-sub-language";
import { type CobaltSettingsV2 } from "$lib/types/settings/v2";

export type CobaltSettingsV3 = Omit<CobaltSettingsV2, 'schemaVersion' | 'save'> & {
    schemaVersion: 3,
    save: Omit<CobaltSettingsV2['save'], 'youtubeDubBrowserLang'> & {
        youtubeDubLang: YoutubeDubLang;
    };
};
