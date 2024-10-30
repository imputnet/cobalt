import type { RecursivePartial } from "$lib/types/generic";
import type { CobaltSettingsV2 } from "./settings/v2";

export * from "./settings/v2";

export type CobaltSettings = CobaltSettingsV2;

export type AnyCobaltSettings = CobaltSettings;

export type PartialSettings = RecursivePartial<CobaltSettings>;

export type AllPartialSettingsWithSchema = RecursivePartial<AnyCobaltSettings> & { schemaVersion: number };

export type DownloadModeOption = CobaltSettings['save']['downloadMode'];
