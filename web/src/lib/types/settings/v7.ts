import type { SubtitleLang } from "$lib/settings/audio-sub-language";
import type { CobaltSettingsV6 } from "$lib/types/settings/v6";
import { downloadModeOptions as previousDownloadModes } from "$lib/types/settings/v2";

export const downloadModeOptions = [...previousDownloadModes, "captions"] as const;
export const captionFormatOptions = ["txt", "vtt", "srt", "md"] as const;
export const transcriptMethodOptions = ["ask", "download", "copy"] as const;

export type CobaltSettingsV7 = Omit<CobaltSettingsV6, "schemaVersion" | "save"> & {
    schemaVersion: 7,
    save: Omit<CobaltSettingsV6["save"], "downloadMode"> & {
        downloadMode: typeof downloadModeOptions[number],
        captionFormat: typeof captionFormatOptions[number],
        captionLang: SubtitleLang,
        transcriptMethod: typeof transcriptMethodOptions[number],
    },
};
