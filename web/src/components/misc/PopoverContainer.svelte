<script lang="ts">
    export let id = "";
    export let expanded = false;
    export let expandStart: "left" | "center" | "right" = "center";

    /*
        a popover isn't pre-rendered by default, because the user might never open it.
        but if they do, we render only once, and then keep it the dom :3
    */

    $: renderPopover = false;
    $: if (expanded && !renderPopover) renderPopover = true;
</script>

<div {id} class="popover {expandStart}" aria-hidden={!expanded} class:expanded>
    {#if renderPopover}
        <slot></slot>
    {/if}
</div>

<style>
    .popover {
        display: flex;
        flex-direction: column;
        border-radius: 18px;
        background: var(--button);
        box-shadow: var(--button-box-shadow);

        filter: drop-shadow(0 0 8px var(--popover-glow))
            drop-shadow(0 0 10px var(--popover-glow));
        position: relative;
        padding: var(--padding);
        gap: 6px;
        top: 6px;
        z-index: 2;

        opacity: 0;
        transform: scale(0);
        transform-origin: top center;

        transition:
            transform 0.3s cubic-bezier(0.53, 0.05, 0.23, 1.15),
            opacity 0.25s cubic-bezier(0.53, 0.05, 0.23, 0.99);

        will-change: transform, opacity;

        pointer-events: all;
    }

    .popover.left {
        transform-origin: top left;
    }

    :global([dir="rtl"]) .popover.left {
        transform-origin: top right;
    }

    .popover.center {
        transform-origin: top center;
    }

    .popover.right {
        transform-origin: top right;
    }

    :global([dir="rtl"]) .popover.right {
        transform-origin: top left;
    }

    .popover.expanded {
        opacity: 1;
        transform: none;
    }
</style>
