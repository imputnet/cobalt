<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { donate } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import DonateBanner from "$components/donate/DonateBanner.svelte";
    import DonateAltItem from "$components/donate/DonateAltItem.svelte";
    import DonateShareCard from "$components/donate/DonateShareCard.svelte";
    import DonateOptionsCard from "$components/donate/DonateOptionsCard.svelte";

    import IconDiamond from "@tabler/icons-svelte/IconDiamond.svelte";
</script>

<svelte:head>
    <title>
        {$t("tabs.donate")} ~ {$t("general.cobalt")}
    </title>
    <meta
        property="og:title"
        content="{$t("tabs.donate")} ~ {$t("general.cobalt")}"
    />
</svelte:head>

<div id="donate-page-wrapper">
    <main id="donate-page">
        <DonateBanner />

        <section id="support-options">
            <DonateOptionsCard />
            <DonateShareCard />
        </section>

        <section id="motivation" class="long-text-noto">
            <p>{$t("donate.body.motivation")}</p>
            <p>{$t("donate.body.keep_going")}</p>
        </section>

        <section id="crypto">
            <div id="crypto-section-header">
                <IconDiamond />
                <h3 id="crypto-title">{$t("donate.alternative.title")}</h3>
            </div>
            <div id="wallet-grid">
                {#each Object.entries(donate.crypto) as [name, address]}
                    <DonateAltItem type="copy" {name} {address} />
                {/each}
                {#each Object.entries(donate.other) as [name, address]}
                    <DonateAltItem type="open" {name} {address} />
                {/each}
            </div>
        </section>
    </main>
</div>

<style>
    #donate-page-wrapper {
        display: flex;
        width: 100%;
        height: max-content;
        justify-content: center;
        overflow-y: scroll;
        overflow-x: hidden;
        padding: var(--padding);
    }

    #donate-page {
        --donate-border-radius: 24px;
        --donate-border-opacity: 0.1;
        --donate-gradient-start: #1a1a1a;
        --donate-gradient-end: #404040;

        max-width: 100%;
        width: 900px;

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

    #motivation,
    #crypto {
        padding: 0 12px;
    }

    #crypto {
        margin-bottom: 12px;
    }

    #crypto-section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
    }

    #crypto-section-header :global(svg) {
        width: 22px;
        height: 22px;
        stroke-width: 1.8px;
    }

    #wallet-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    @media screen and (max-width: 760px) {
        #support-options {
            flex-direction: column;
        }

        #wallet-grid {
            grid-template-columns: 1fr;
        }

        #motivation,
        #crypto {
            padding: 0 6px;
        }
    }
</style>
