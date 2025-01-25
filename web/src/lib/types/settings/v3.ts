import type { YoutubeLang } from "$lib/settings/youtube-lang";
import { type CobaltSettingsV2 } from "$lib/types/settings/v2";

export type CobaltSettingsV3 = Omit<CobaltSettingsV2, 'schemaVersion' | 'save'> & {
    schemaVersion: 3,
    save: Omit<CobaltSettingsV2['save'], 'youtubeDubBrowserLang'> & {
        youtubeDubLang: YoutubeLang;
    };
};
