<script lang="ts">
    import IconCalendarRepeat from "@tabler/icons-svelte/IconCalendarRepeat.svelte";
    import IconCoin from "@tabler/icons-svelte/IconCoin.svelte";
    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";

    import IconCup from "@tabler/icons-svelte/IconCup.svelte";
    import IconPizza from "@tabler/icons-svelte/IconPizza.svelte";
    import IconToolsKitchen2 from "@tabler/icons-svelte/IconToolsKitchen2.svelte";

    import DonationOption from "$components/donate/DonationOption.svelte";

    import { donate } from "$lib/env";

    let customInputValue: number;

    const donateStripe = (amount: number) => {
        const url = new URL(donate.stripe);
        url.searchParams.set("__prefilled_amount", (amount * 100).toString());
        window.open(url, "_blank");
    };

    const donateLibera = (amount: number) => {
        const url = new URL(donate.liberapay);
        url.searchParams.set("currency", "USD");
        url.searchParams.set("period", "monthly");
        url.searchParams.set("amount", (amount / 100).toString());
        window.open(url, "_blank");
    };

    const toClipboard = (text: string) => navigator.clipboard.writeText(text);
</script>

<div id="donation-box">
    <div id="donation-types">
        <button id="donation-type-once" class="donation-type selected">
            <div class="donation-type-icon"><IconCoin /></div>
            <div class="donation-title">one-time donation</div>
            <div class="donation-subtitle">processed by stripe</div>
        </button>
        <button id="donation-type-monthly" class="donation-type">
            <div class="donation-type-icon"><IconCalendarRepeat /></div>
            <div class="donation-title">monthly donation</div>
            <div class="donation-subtitle">processed by liberapay</div>
        </button>
    </div>
    <div id="donation-options">
        <DonationOption
            price={5}
            desc="cup of coffee"
            click={() => donateStripe(5)}
        >
            <IconCup />
        </DonationOption>
        <DonationOption
            price={10}
            desc="full size pizza"
            click={() => donateStripe(10)}
        >
            <IconPizza />
        </DonationOption>
        <DonationOption
            price={15}
            desc="full lunch"
            click={() => donateStripe(15)}
        >
            <IconToolsKitchen2 />
        </DonationOption>
        <DonationOption
            price={30}
            desc="two lunches"
            click={() => donateStripe(30)}
        >
            <IconToolsKitchen2 />
        </DonationOption>
    </div>
    <div id="donation-custom">
        <input
            id="donation-custom-input"
            type="number"
            placeholder="custom amount (from $2)"
            bind:value={customInputValue}
        />
        <button
            id="donation-custom-submit"
            on:click={() => donateStripe(customInputValue)}
        >
            <IconArrowRight />
        </button>
    </div>
</div>

<style>
    #donation-box {
        --donation-box-padding: 12px;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 480px;

        padding: var(--donate-border-radius);
        border-radius: var(--donate-border-radius);
        gap: calc(var(--donate-border-radius) / 2);

        color: white;
        background: linear-gradient(
            180deg,
            var(--donate-gradient-end) 0%,
            var(--donate-gradient-start) 80%
        );
        box-shadow: 0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity))
            inset;
    }

    #donation-types {
        display: flex;
        flex-direction: row;
        gap: var(--donation-box-padding);
    }

    .donation-type,
    :global(.donation-option) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        border-radius: var(--donation-box-padding);
        background: rgba(255, 255, 255, 0.05);
        padding: 14px 18px;
        color: var(--white);
        gap: 0;
        letter-spacing: -0.3px;
    }

    .donation-type {
        width: 100%;
    }

    :global(#donation-box button:not(:focus-visible)) {
        box-shadow: none;
    }

    @media (hover: hover) {
        :global(#donation-box button:hover) {
            background: rgba(255, 255, 255, 0.1);
        }
    }

    .donation-type.selected {
        background: rgba(255, 255, 255, 0.15);
    }

    .donation-type.selected:not(:focus-visible) {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) inset !important;
    }

    .donation-subtitle {
        line-height: 1.5;
    }

    .donation-type-icon :global(svg) {
        width: 28px;
        height: 28px;
    }

    :global(.donation-title) {
        display: flex;
        align-items: center;
        font-size: 16px;
        gap: 4px;
    }

    :global(.donation-subtitle) {
        font-size: 13px;
        color: #9a9a9a;
    }

    #donation-options {
        display: flex;
        overflow-x: scroll;
        gap: 6px;
    }

    #donation-custom {
        display: flex;
        gap: 6px;
    }

    #donation-custom-input {
        flex: 1;
        padding: 12px 18px;
        width: 100%;
        font-size: 13px;
        border-radius: 12px;
        color: var(--white);
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
    }

    #donation-custom-submit {
        color: var(--white);
        background-color: rgba(255, 255, 255, 0.1);
        aspect-ratio: 1/1;
        padding: 8px;
    }

    #donation-custom-submit :global(svg) {
        width: 24px;
        height: 24px;
    }

    #donation-custom-input::-webkit-outer-spin-button,
    #donation-custom-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
