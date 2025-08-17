import defaults from "$lib/settings/defaults";
import type { CobaltSettings } from "$lib/types/settings";

export default function lazySettingGetter(settings: CobaltSettings) {
    // Returns the setting value only if it differs from the default.
    return <
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    >(context: Context, key: Id) => {
        if (defaults[context][key] !== settings[context][key]) {
            return settings[context][key];
        }
    }
}
