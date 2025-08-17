<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    "
>
    import { hapticSwitch } from "$lib/haptics";
    import settings, { updateSetting } from "$lib/state/settings";
    import type { CobaltSettings } from "$lib/types/settings";

    import Toggle from "$components/misc/Toggle.svelte";

    export let settingId: Id;
    export let settingContext: Context;

    export let title: string;
    export let description: string = "";

    export let disabled = false;
    export let disabledOpacity = false;

    $: setting = $settings[settingContext][settingId];
    $: isEnabled = !!setting;
</script>

<div
    id="setting-toggle-{settingContext}-{String(settingId)}"
    class="toggle-parent"
    class:disabled
    class:faded={disabledOpacity}
    aria-hidden={disabled}
>
    <button
        class="button toggle-container"
        role="switch"
        aria-checked={isEnabled}
        {disabled}
        on:click={() => {
            hapticSwitch();
            updateSetting({
                [settingContext]: {
                    [settingId]: !isEnabled,
                },
            });
        }}
    >
        <h4 class="toggle-title">{title}</h4>
        <Toggle enabled={isEnabled} />
    </button>

    {#if description}
        <div class="subtext toggle-description">{description}</div>
    {/if}
</div>

<style>
    .toggle-parent {
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: hidden;
        transition: opacity 0.2s;
    }

    .toggle-parent.disabled {
        pointer-events: none;
    }

    .toggle-parent.faded {
        opacity: 0.5;
    }

    .toggle-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--padding);
        justify-content: space-between;
        text-align: start;
        transform: none;
        padding: calc(var(--switcher-padding) * 2) 16px;
        border-radius: var(--border-radius);
        overflow: scroll;
        transition: box-shadow 0.1s;
    }

    .toggle-container:active {
        box-shadow:
            var(--button-box-shadow),
            0 0 0 1.5px var(--button-stroke) inset;
    }
</style>
