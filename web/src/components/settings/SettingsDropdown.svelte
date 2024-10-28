<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    "
>
    import { updateSetting } from "$lib/state/settings";
    import type { CobaltSettings } from "$lib/types/settings";

    import IconSelector from "@tabler/icons-svelte/IconSelector.svelte";

    export let title: string;
    export let description: string = "";
    export let items: Record<string, string>;

    export let settingId: Id;
    export let settingContext: Context;

    export let selectedOption: string;
    export let selectedTitle: string;
    export let disabled = false;

    const onChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;

        updateSetting({
            [settingContext]: {
                [settingId]: target.value,
            },
        });
    };
</script>

<div class="selector-parent" class:disabled aria-hidden={disabled}>
    <div id="selector" class="selector button">
        <div class="selector-info">
            <h4 class="selector-title">
                {title}
            </h4>
            <div class="right-side">
                <span class="selector-current" aria-hidden="true">
                    {selectedTitle.split("(", 2)[0]}
                </span>
                <IconSelector />
            </div>
        </div>

        <select on:change={e => onChange(e)} {disabled}>
            {#each Object.keys(items) as value, i}
                <option {value} selected={selectedOption === value}>
                    {items[value]}
                </option>
                {#if i === 0}
                    <hr>
                {/if}
            {/each}
        </select>
    </div>

    {#if description}
        <div class="subtext">
            {description}
        </div>
    {/if}
</div>

<style>
    .selector-parent {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: hidden;
        transition: opacity 0.2s;
    }

    .selector-parent.disabled {
        opacity: 0.5;
    }

    #selector {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        position: relative;

        padding: calc(var(--switcher-padding) * 2) 16px;

        pointer-events: all;
        overflow: scroll;
    }

    .disabled #selector {
        pointer-events: none;
    }

    .selector-info {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        gap: var(--padding);
        min-height: 26px;

        z-index: 2;
        pointer-events: none;
    }

    .right-side {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        float: right;
        gap: calc(var(--padding) / 2);
    }

    .selector-current,
    .selector select {
        font-size: 13px;
        font-weight: 400;
        text-transform: lowercase;
    }

    .right-side :global(svg) {
        stroke-width: 1.5px;
        height: 20px;
        width: 20px;
        stroke: var(--secondary);
    }

    .selector select {
        position: absolute;
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        left: 0;
        border-radius: var(--border-radius);
        cursor: pointer;
        color: transparent;
        text-align: right;

        /* safari fix */
        appearance: initial;
        text-align-last: right;
    }

    /* fix for chrome on windows */
    option {
        color: initial;
        text-align: initial;
        text-align-last: initial;
        border-radius: initial;
        background: initial;
        border: initial;
    }

    @media (hover: hover) {
        .selector:hover {
            background-color: var(--button-hover);
        }
    }
</style>
