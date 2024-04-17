<script>
    export let click;
    import IconX from '@tabler/icons-svelte/IconX.svelte';
</script>
<style>
    #clear-button {
        padding: 3px;
        border-radius: 100%;
    }
</style>

<button id="clear-button" on:click={click}>
    <IconX color="var(--accent)" size="16px"/>
</button>