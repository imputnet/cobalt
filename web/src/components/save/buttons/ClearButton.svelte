<script>
    import { t } from "$lib/i18n/translations";
    import IconX from "@tabler/icons-svelte/IconX.svelte";

    export let click;
</script>

<button
    id="clear-button"
    class="button"
    on:click={click}
    aria-label={$t("a11y.save.clear_input")}
>
    <IconX />
</button>

<style>
    #clear-button {
        padding: 4px;
        border-radius: 100%;
        background: var(--glass-bg-light);
        border: 1px solid var(--glass-border-light);
        transition: all 0.2s ease;
    }

    #clear-button:hover {
        background: rgba(249, 115, 22, 0.15);
        border-color: rgba(249, 115, 22, 0.3);
    }

    #clear-button :global(svg) {
        width: 16px;
        height: 16px;
        stroke-width: 2px;
        stroke: var(--secondary);
        will-change: transform;
        transition: stroke 0.2s ease;
    }

    #clear-button:hover :global(svg) {
        stroke: var(--orange);
    }
</style>
