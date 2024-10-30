import type { RecursivePartial } from "$lib/types/generic";
import type {
  AllPartialSettingsWithSchema,
  CobaltSettingsV3,
  PartialSettings,
} from "$lib/types/settings";
import { getBrowserLanguage } from "$lib/settings/youtube-lang";

type Migrator = (
  s: AllPartialSettingsWithSchema
) => AllPartialSettingsWithSchema;
const migrations: Record<number, Migrator> = {
  [3]: (settings: AllPartialSettingsWithSchema) => {
    const out = settings as RecursivePartial<CobaltSettingsV3>;
    out.schemaVersion = 3;

    if (settings?.save && "youtubeDubBrowserLang" in settings.save) {
      if (settings.save.youtubeDubBrowserLang) {
        out.save!.youtubeDubLang = getBrowserLanguage();
      }

      delete settings.save.youtubeDubBrowserLang;
    }

    return out as AllPartialSettingsWithSchema;
  },
};

export const migrate = (
  settings: AllPartialSettingsWithSchema
): PartialSettings => {
  return Object.keys(migrations)
    .map(Number)
    .filter((version) => version > settings.schemaVersion)
    .reduce((settings, migrationVersion) => {
      return migrations[migrationVersion](settings);
    }, settings as AllPartialSettingsWithSchema) as PartialSettings;
};
