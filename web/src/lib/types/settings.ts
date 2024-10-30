import type { RecursivePartial } from "$lib/types/generic";
import type { CobaltSettingsV2 } from "./settings/v2";
import type { CobaltSettingsV3 } from "./settings/v3";

export * from "./settings/v2";
export * from "./settings/v3";

export type CobaltSettings = CobaltSettingsV3;

export type AnyCobaltSettings = CobaltSettingsV2 | CobaltSettings;

export type PartialSettings = RecursivePartial<CobaltSettings>;

export type AllPartialSettingsWithSchema = RecursivePartial<AnyCobaltSettings> & { schemaVersion: number };

export type DownloadModeOption = CobaltSettings['save']['downloadMode'];
