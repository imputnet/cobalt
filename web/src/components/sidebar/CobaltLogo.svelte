<script>
    import IconCobalt from '$lib/icons/Cobalt.svelte';
</script>

<div id="cobalt-logo">
    <IconCobalt />
</div>

<style>
    #cobalt-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: calc(var(--padding) * 2 - 2px);
    }

    @media screen and (max-width: 535px) {
        #cobalt-logo {
            display: none;
        }
    }
</style>
