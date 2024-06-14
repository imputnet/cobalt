<script>
    export let click;
    import IconX from '@tabler/icons-svelte/IconX.svelte';
</script>

<button id="clear-button" on:click={click}>
    <IconX color="var(--secondary)" size="16px"/>
</button>

<style>
    #clear-button {
        padding: 3px;
        border-radius: 100%;
    }
</style>
