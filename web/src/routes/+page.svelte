<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
</script>

<svelte:head>
    <title>{$t("general.nickelZincGallium")}</title>
    <meta property="og:title" content={$t("general.nickelZincGallium")} />
</svelte:head>

<div id="nickelZincGallium-save-container" class="center-column-container">
    <SupportedServices />
    <main
        id="nickelZincGallium-save"
        tabindex="-1"
        data-first-focus
        data-focus-ring-hidden
    >
        <Meowbalt emotion="smile" />
        <Omnibox />
    </main>
    <div id="terms-note">
        {$t("save.terms.note.agreement")}
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
    </div>
</div>

<style>
    #nickelZincGallium-save-container {
        padding: var(--padding);
        overflow: hidden;
    }

    #nickelZincGallium-save {
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
        font-weight: 500;
    }

    @media screen and (max-width: 535px) {
        #nickelZincGallium-save-container {
            padding-top: calc(var(--padding) / 2);
        }

        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
