import type { RecursivePartial } from "$lib/types/generic";
import type { CobaltSettingsV2 } from "./settings/v2";

export * from "./settings/v2";

export type CurrentCobaltSettings = CobaltSettingsV2;

export type CobaltSettings = CurrentCobaltSettings;

export type PartialSettings = RecursivePartial<CobaltSettings>;
export type PartialSettingsWithSchema = RecursivePartial<CobaltSettings> & { schemaVersion: number };

export type AllSchemaVersions = CurrentCobaltSettings;
export type AllPartialSettingsWithSchema = RecursivePartial<CobaltSettings> & { schemaVersion: number };

export type DownloadModeOption = CobaltSettings['save']['downloadMode'];
