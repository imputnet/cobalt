<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { t } from "$lib/i18n/translations";

    import DonateBanner from "$components/donate/DonateBanner.svelte";
    import DonateOptionsCard from "$components/donate/DonateOptionsCard.svelte";
    import DonateShareCard from "$components/donate/DonateShareCard.svelte";
</script>

<svelte:head>
    <title>
        {$t("tabs.donate")} ~ {$t("general.cobalt")}
    </title>
</svelte:head>

<main id="donate-page">
    <DonateBanner />
    <section id="support-options">
        <DonateOptionsCard />
        <DonateShareCard />
    </section>
    <section id="donate-text" class="long-text-noto">
        <p>
            {$t("donate.body.motivation")}
        </p>
        <p>
            {$t("donate.body.keep_going")}
        </p>
    </section>
</main>

<style>
    #donate-page {
        --donate-border-radius: 24px;
        --donate-border-opacity: 0.1;
        --donate-gradient-start: #1a1a1a;
        --donate-gradient-end: #404040;

        max-width: 950px;
        width: 900px;
        margin: 0 auto;
        overflow-x: hidden;
        padding: var(--padding);

        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    :global([data-theme="dark"]) #donate-page {
        --donate-border-opacity: 0.05;
        --donate-gradient-start: #111111;
        --donate-gradient-end: #2a2a2a;
    }

    #support-options {
        display: flex;
        flex-direction: row;
        gap: 15px;
        width: 100%;
    }

    #donate-text {
        padding: 0 24px;
    }

    @media screen and (max-width: 760px) {
        #support-options {
            flex-direction: column;
        }

        #donate-text {
            padding: 0 6px;
        }
    }
</style>
