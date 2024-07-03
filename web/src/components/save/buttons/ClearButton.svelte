<script>
    import { t } from "$lib/i18n/translations";
    import IconX from '@tabler/icons-svelte/IconX.svelte';

    export let click;
</script>

<button id="clear-button" on:click={click} aria-label={$t("a11y.save.clearInput")}>
    <IconX color="var(--secondary)" size="16px"/>
</button>

<style>
    #clear-button {
        padding: 3px;
        border-radius: 100%;
    }
</style>
