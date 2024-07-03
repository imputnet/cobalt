<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import MeowbaltLoaf from "$components/meowbalt/MeowbaltLoaf.svelte";
</script>

<svelte:head>
    <title>{$t("general.cobalt")}</title>
</svelte:head>

<div id="cobalt-save-container" class="center-column-container">
    <main id="cobalt-save">
        <MeowbaltLoaf />
        <Omnibox />
    </main>
    <div id="terms-note">
        {$t("save.termsNote")}
    </div>
</div>

<style>
    #cobalt-save-container {
        padding: var(--padding);
        overflow: hidden;
    }

    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 15px;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 13px;
        text-align: center;
        padding-bottom: var(--padding);
    }

    @media screen and (max-width: 535px) {
        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
