<script lang="ts">
    import IconCalendarRepeat from "@tabler/icons-svelte/IconCalendarRepeat.svelte";
    import IconCup from "@tabler/icons-svelte/IconCup.svelte";
    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";

    import { donate } from "$lib/env";

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

<div class="donation-box">
    <div class="donation-info">
        <div class="donation-icon"><IconCalendarRepeat /></div>
        <div class="donation-title">monthly donation</div>
        <div class="donation-subtitle">processed by liberapay</div>
    </div>
    <div class="donation-scrollbox">
        {#each { length: 4 } as _}
            <!-- TODO: maybe move this also into a component -->
            <button class="donation-option">
                <div class="donation-amount"><IconCup /> $5</div>
                <div class="donation-subtitle">cup of coffee</div>
            </button>
        {/each}
    </div>
    <div class="donation-custom">
        <input type="number" placeholder="custom amount (from $2)" />
        <button><IconArrowRight /></button>
    </div>
    <div class="donation-footer donation-subtitle">
        you will be redirected to liberapay
    </div>
</div>

<style>
    .donation-box {
        display: flex;
        flex-direction: column;
        width: 100%;

        padding: var(--donate-border-radius);
        border-radius: var(--donate-border-radius);
        gap: calc(var(--donate-border-radius) / 2);

        color: white;
        background: linear-gradient(
            180deg,
            var(--donate-gradient-end) 0%,
            var(--donate-gradient-start) 80%
        );
        box-shadow: 0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity)) inset;
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
