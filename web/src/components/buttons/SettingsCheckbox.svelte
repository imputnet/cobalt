<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    "
>
    import settings, { updateSetting } from "$lib/settings";
    import type { CobaltSettings } from "$lib/types/settings";

    export let settingContext: Context;
    export let settingId: Id;

    $: setting = $settings[settingContext][settingId];
    $: isChecked = !!setting;
</script>

<div>
    <input
        type="checkbox"
        id="setting-button-{settingContext}-{String(settingId)}"
        bind:checked={isChecked}
        on:change={() =>
            updateSetting({
                [settingContext]: {
                    [settingId]: isChecked,
                },
            })}
    />
    <slot></slot>
</div>
