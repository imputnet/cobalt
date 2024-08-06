<script lang="ts">
    import "@fontsource/redaction-10/400.css";
    import { t } from "$lib/i18n/translations";
    import DonateBanner from "$components/donate/DonateBanner.svelte";
    import DonateOptionsCard from "$components/donate/DonateOptionsCard.svelte";
</script>

<svelte:head>
    <title>
        {$t("general.cobalt")}: {$t("tabs.donate")}
    </title>
</svelte:head>

<main id="donate-page">
    <DonateBanner />
    <section id="support-options">
        <DonateOptionsCard />
        <DonateOptionsCard />
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
        --donate-gradient-start: #101010;
        --donate-gradient-end: #2d2d2d;
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
</style>
