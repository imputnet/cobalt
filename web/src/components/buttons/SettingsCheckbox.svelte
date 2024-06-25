<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    "
>
    import settings, { updateSetting } from "$lib/settings";
    import type { CobaltSettings } from "$lib/types/settings";

    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";

    export let settingContext: Context;
    export let settingId: Id;

    export let title: string;
    export let description: string = "";

    $: setting = $settings[settingContext][settingId];
    $: isChecked = !!setting;
</script>

<button
    id="setting-button-{settingContext}-{String(settingId)}"
    class="checkbox-container"
    on:click={() => {
        updateSetting({
            [settingContext]: {
                [settingId]: !isChecked,
            },
        });
        console.log("yass", !isChecked);
    }}
>
    <div class="checkbox" class:checked={isChecked}>
        <div class="checkbox-icon">
            <IconCheck />
        </div>
    </div>
    <div class="checkbox-text">
        <h4 class="checkbox-title">{title}</h4>

        {#if description.length > 0}
            <div class="subtext checkbox-description">{description}</div>
        {/if}
    </div>
</button>

<style>
    .checkbox-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        justify-content: start;
        text-align: left;
        transform: none;
        padding: 6px 12px;
    }

    .checkbox-text {
        display: flex;
        flex-direction: column;
    }

    .checkbox {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1px;
        aspect-ratio: 1/1;
        border-radius: 5px;
        box-shadow: 0 0 0 2px var(--secondary);
    }

    .checkbox-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
    }

    .checkbox-icon :global(svg) {
        height: 18px;
        width: 18px;
        stroke: var(--primary);
        stroke-width: 2px;
    }

    .checkbox.checked {
        background: var(--secondary);
    }

    .checkbox.checked .checkbox-icon {
        opacity: 1;
    }

    .checkbox-description {
        font-size: 12px;
    }
</style>
