<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context],
        Key extends CobaltSettings[Context][Id]
    "
>
    import settings, { updateSetting } from "$lib/settings";
    import type { CobaltSettings } from "$lib/types/settings";

    export let settingContext: Context;
    export let settingId: Id;
    export let settingKey: Key;

    $: setting = $settings[settingContext][settingId];
    $: isSelected = setting === settingKey;
</script>

<button
    id="setting-button-{settingContext}-{String(settingId)}-{settingKey}"
    class="button"
    class:selected={isSelected}
    on:click={() =>
        updateSetting({
            [settingContext]: {
                [settingId]: settingKey,
            },
        })}
>
    <slot></slot>
</button>
