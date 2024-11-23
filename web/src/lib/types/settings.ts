import type { RecursivePartial } from "$lib/types/generic";
import type { CobaltSettingsV2 } from "$lib/types/settings/v2";
import type { CobaltSettingsV3 } from "$lib/types/settings/v3";
import type { CobaltSettingsV4 } from "$lib/types/settings/v4";

export * from "$lib/types/settings/v2";
export * from "$lib/types/settings/v3";
export * from "$lib/types/settings/v4";

export type CobaltSettings = CobaltSettingsV4;

export type AnyCobaltSettings = CobaltSettingsV3 | CobaltSettingsV2 | CobaltSettings;

export type PartialSettings = RecursivePartial<CobaltSettings>;

export type AllPartialSettingsWithSchema = RecursivePartial<AnyCobaltSettings> & { schemaVersion: number };

export type DownloadModeOption = CobaltSettings['save']['downloadMode'];
