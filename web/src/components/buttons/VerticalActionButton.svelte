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
    }

    .button.vertical :global(svg) {
        width: 24px;
        height: 24px;
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
