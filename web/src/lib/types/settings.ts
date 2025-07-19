import type { RecursivePartial } from "$lib/types/generic";
import type { CobaltSettingsV2 } from "$lib/types/settings/v2";
import type { CobaltSettingsV3 } from "$lib/types/settings/v3";
import type { CobaltSettingsV4 } from "$lib/types/settings/v4";
import type { CobaltSettingsV5 } from "$lib/types/settings/v5";
import type { CobaltSettingsV6 } from "$lib/types/settings/v6";

export * from "$lib/types/settings/v2";
export * from "$lib/types/settings/v3";
export * from "$lib/types/settings/v4";
export * from "$lib/types/settings/v5";
export * from "$lib/types/settings/v6";

export type CobaltSettings = CobaltSettingsV6;

export type AnyCobaltSettings = CobaltSettingsV5 | CobaltSettingsV4 | CobaltSettingsV3 | CobaltSettingsV2 | CobaltSettings;

export type PartialSettings = RecursivePartial<CobaltSettings>;

export type AllPartialSettingsWithSchema = RecursivePartial<AnyCobaltSettings> & { schemaVersion: number };

export type DownloadModeOption = CobaltSettings['save']['downloadMode'];
