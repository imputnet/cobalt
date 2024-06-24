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

    export let title: string;
    export let description: string = "";

    $: setting = $settings[settingContext][settingId];
    $: isChecked = !!setting;
</script>

<div class="checkbox-container">
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
    <div class="checkbox-text">
        <h4 class="checkbox-title">{title}</h4>

        {#if description.length > 0}
            <div class="subtext checkbox-description">{description}</div>
        {/if}
    </div>
</div>

<style>
    .checkbox-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }

    .checkbox-text {
        display: flex;
        flex-direction: column;
    }

    .checkbox-description {
        font-size: 12px;
    }
</style>