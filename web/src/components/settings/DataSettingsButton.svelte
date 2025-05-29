<script lang="ts">
    export let id: string;
    export let click: () => void;
    export let danger = false;
</script>

<button {id} class="button data-button" class:danger on:click={click}>
    <slot></slot>
</button>

<style>
    .data-button {
        padding: 8px 14px;
        width: max-content;
        text-align: start;
    }

    .data-button :global(svg) {
        stroke-width: 1.8px;
        height: 21px;
        width: 21px;
    }

    .data-button.danger {
        background-color: var(--red);
        color: var(--white);
    }

    .data-button.danger:hover {
        background-color: var(--dark-red);
    }
</style>
