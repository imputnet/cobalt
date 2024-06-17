<script lang="ts">
    export let id: string;
    export let click = () => { alert('no function assigned') };
</script>

<button id={id} class="button" on:click={click}>
    <slot></slot>
</button>

<style>
    :global(.button.selected) {
        background: var(--secondary);
        color: var(--primary);
    }
</style>
