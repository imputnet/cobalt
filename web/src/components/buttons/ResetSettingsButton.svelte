<script lang="ts">
    import { t } from '$lib/i18n/translations';
    import IconTrash from '@tabler/icons-svelte/IconTrash.svelte';
    import { resetSettings } from '$lib/state/settings';
</script>

<button id="setting-button-reset" class="button" on:click={resetSettings}>
    <IconTrash /> { $t('settings.advanced.reset') }
</button>

<style>
    button {
        background-color: var(--red);
        color: var(--white);
        width: max-content;
        text-align: left;
    }

    button:hover {
        background-color: var(--dark-red);
    }
</style>
