<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { t } from "$lib/i18n/translations";
    import { donate } from "$lib/env";
    import DonateBanner from "$components/misc/DonateBanner.svelte";
    import IconCalendarRepeat from "@tabler/icons-svelte/IconCalendarRepeat.svelte";
    import IconCup from "@tabler/icons-svelte/IconCup.svelte";
    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";

    let customAmountOnceInput: HTMLInputElement;
    let customAmountRecurringInput: HTMLInputElement;

    const donateStripe = (amount: number) => {
        const url = new URL(donate.stripe);
        url.searchParams.set('__prefilled_amount', amount.toString());
        window.open(url, '_blank');
    }

    const donateLibera = (amount: number) => {
        const url = new URL(donate.liberapay);
        url.searchParams.set('currency', 'USD');
        url.searchParams.set('period', 'monthly');
        url.searchParams.set('amount', (amount / 100).toString());
        window.open(url, '_blank');
    }

    const toClipboard = (text: string) => navigator.clipboard.writeText(text);
</script>

<svelte:head>
    <title>
        {$t("general.cobalt")}: {$t("tabs.donate")}
    </title>
</svelte:head>

<main id="donate-page">
    <DonateBanner />
    <section id="donation-options">
        {#each {length: 2} as _}
        <!-- TODO: move this whole thing into a component -->
        <div class="donation-box">
            <div class="donation-info">
                <div class="donation-icon"><IconCalendarRepeat /></div>
                <div class="donation-title">monthly donation</div>
                <div class="donation-subtitle">processed by liberapay</div>
            </div>
            <div class="donation-scrollbox">
                {#each {length: 4} as _}
                <!-- TODO: maybe move this also into a component -->
                <button class="donation-option">
                    <div class="donation-amount"><IconCup /> $5</div>
                    <div class="donation-subtitle">cup of coffee</div>
                </button>
                {/each}
            </div>
            <div class="donation-custom">
                <input type="number" placeholder="custom amount (from $2)">
                <button><IconArrowRight /></button>
            </div>
            <div class="donation-footer donation-subtitle">
                you will be redirected to liberapay
            </div>
        </div>
        {/each}
    </section>
</main>

<style>
    #donate-page {
        max-width: 950px;
        margin: 0 auto;
        overflow-x: hidden;
        padding: var(--padding);
    }

    #donation-options {
        display: flex;
        justify-content: space-evenly;
        padding-top: 16px;
    }

    .donation-box {
        display: flex;
        flex-direction: column;
        border-radius: calc(3 * var(--border-radius));
        padding: 32px;

        background: linear-gradient(
            rgba(65,65,65,1) 5%,
            rgba(26,26,26,1)
        );
        color: white;
        gap: 8px;
    }

    .donation-icon :global(*) {
        width: 28px;
        height: 28px;
    }

    .donation-title {
        font-size: 14.5px;
    }

    .donation-subtitle {
        font-size: 12px;
        color: #9a9a9a;
    }

    .donation-scrollbox {
        display: flex;
        overflow-x: scroll;
        width: 384px;
        gap: 5px;
    }

    .donation-option {
        display: flex;
        flex-direction: column;
        background: #3b3b3b;
        color: white;
        align-items: start;
        padding: 15px;
        border-radius: var(--border-radius);
        width: 128px;
    }

    .donation-amount {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .donation-custom {
        display: flex;
        gap: 4px;
    }

    .donation-custom * {
        border-radius: var(--border-radius);
        border: none;
        background-color: #3b3b3b;
        color: white;
    }

    .donation-custom input {
        flex: 1;
        padding-left: 12px;
    }

    .donation-footer {
        text-align: center;
    }
</style>
