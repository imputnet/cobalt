<script lang="ts">
    export let id: string;
    export let click = () => {
        alert("no function assigned");
    };
    export let fill = false;
    export let elevated = false;
    export let ariaLabel = "";
</script>

<button
    id="button-{id}"
    class="button vertical"
    class:fill
    class:elevated
    on:click={click}
    aria-label={ariaLabel}
>
    <slot></slot>
</button>

<style>
    .button.vertical {
        flex-direction: column;
        line-height: 1;
        padding: var(--padding);
        gap: calc(var(--padding) / 2);
        background: var(--glass-bg-light);
        border: 1px solid var(--glass-border-light);
        transition: all 0.25s ease;
    }

    .button.vertical:hover {
        background: var(--button-hover);
        border-color: rgba(249, 115, 22, 0.3);
        box-shadow: 0 0 16px rgba(249, 115, 22, 0.15);
    }

    .button.vertical :global(svg) {
        width: 24px;
        height: 24px;
        transition: color 0.2s ease;
    }

    .button.vertical:hover :global(svg) {
        color: var(--orange);
    }

    .button.vertical.fill {
        width: 100%;
        padding: var(--padding) 0;
    }

    .button.vertical :global(svg) {
        stroke-width: 1.8px;
        color: var(--secondary);
    }
</style>
