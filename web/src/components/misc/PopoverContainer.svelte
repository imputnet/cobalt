<script lang="ts">
    export let id = "";
    export let expanded = false;
    export let popoverAction: () => void;
    export let expandStart: "left" | "center" | "right" = "center";

    $: renderPopover = false;

    export const showPopover = async () => {
        const timeout = !renderPopover;
        renderPopover = true;

        // 10ms delay to let the popover render for the first time
        if (timeout) {
            setTimeout(popoverAction, 10);
        } else {
            popoverAction();
        }
    };
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
        box-shadow:
            var(--button-box-shadow),
            0 0 10px 10px var(--popover-glow);

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

        pointer-events: all;
    }

    .popover.left {
        transform-origin: top left;
    }

    .popover.center {
        transform-origin: top center;
    }

    .popover.right {
        transform-origin: top right;
    }

    .popover.expanded {
        opacity: 1;
        transform: none;
    }
</style>
