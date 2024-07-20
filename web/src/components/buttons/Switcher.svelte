<script lang="ts">
    export let big: boolean = false;
    export let description: string = "";
</script>

<div class="switcher-parent">
    <div class="switcher" class:big={big} role="listbox">
        <slot></slot>
    </div>
    {#if description}
        <div class="settings-content-description subtext">{description}</div>
    {/if}
</div>

<style>
    .switcher-parent {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .switcher {
        display: flex;
        width: auto;
        flex-direction: row;
        flex-wrap: nowrap;
        scrollbar-width: none;
        overflow-x: scroll;
        border-radius: var(--border-radius);
    }

    .switcher :global(.button) {
        white-space: nowrap;
    }

    .switcher:not(.big) :global(.button:first-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .switcher:not(.big) :global(.button:last-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .switcher.big {
        background: var(--button);
        box-shadow: var(--button-box-shadow);
        padding: var(--switcher-padding);
    }

    .switcher :global(.button.active) {
        pointer-events: none;
    }

    .switcher :global(.button.active:hover) {
        background: var(--secondary);
    }

    .switcher.big :global(.button) {
        width: 100%;
        /* [base button height] - ([switcher padding] * [padding factor to accommodate for]) */
        height: calc(40px - var(--switcher-padding) * 1.5);
        border-radius: calc(var(--border-radius) - var(--switcher-padding));;
    }

    .switcher.big :global(.button:not(:focus-visible)) {
        box-shadow: none;
    }

    .switcher.big :global(.button:not(.active, :hover, :active)) {
        background-color: transparent;
    }

    .switcher:not(.big) :global(.button:not(:first-child, :last-child)) {
        border-radius: 0;
    }

    /* hack to get rid of double border in a list of switches */
    .switcher:not(.big) :global(:not(.button:first-child)) {
        margin-left: -1.5px;
    }
</style>
