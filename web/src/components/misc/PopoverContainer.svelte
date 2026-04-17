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
        background: var(--glass-bg-medium);
        backdrop-filter: var(--glass-blur-heavy);
        -webkit-backdrop-filter: var(--glass-blur-heavy);
        border: 1px solid var(--glass-border);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(249, 115, 22, 0.1);

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
