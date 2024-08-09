<script lang="ts">
    import { donate } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import IconCoin from "@tabler/icons-svelte/IconCoin.svelte";
    import IconCalendarRepeat from "@tabler/icons-svelte/IconCalendarRepeat.svelte";

    import DonationOption from "$components/donate/DonationOption.svelte";

    import IconCup from "@tabler/icons-svelte/IconCup.svelte";
    import IconPizza from "@tabler/icons-svelte/IconPizza.svelte";
    import IconToolsKitchen2 from "@tabler/icons-svelte/IconToolsKitchen2.svelte";

    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";

    let customInput: HTMLInputElement;
    let customInputValue: number | null;
    let customFocused = false;

    type Processor = "stripe" | "liberapay";
    let processor: Processor = "stripe";

    const donationMethods: Record<Processor, (_: number) => void> = {
        stripe: (amount: number) => {
            const url = new URL(donate.stripe);
            url.searchParams.set("__prefilled_amount", amount.toString());
            window.open(url, "_blank");
        },
        liberapay: (amount: number) => {
            const url = new URL(donate.liberapay);
            url.searchParams.set("currency", "USD");
            url.searchParams.set("period", "monthly");
            url.searchParams.set("amount", (amount / 100).toString());
            window.open(url, "_blank");
        },
    };

    const send = (amount: number) => {
        return donationMethods[processor](amount);
    };

    const sendCustom = () => {
        if (!customInput.reportValidity()) {
            return;
        }

        const amount = Number(customInputValue) * 100;
        send(amount);
    };
</script>

<div id="donation-box">
    <div id="donation-types">
        <button
            id="donation-type-once"
            class="donation-type"
            on:click={() => (processor = "stripe")}
            class:selected={processor === "stripe"}
        >
            <div class="donation-type-icon"><IconCoin /></div>
            <div class="donation-title">{$t("donate.card.once")}</div>
            <div class="donation-subtitle">
                {$t("donate.card.processor.stripe")}
            </div>
        </button>
        <button
            id="donation-type-monthly"
            class="donation-type"
            on:click={() => (processor = "liberapay")}
            class:selected={processor === "liberapay"}
        >
            <div class="donation-type-icon"><IconCalendarRepeat /></div>
            <div class="donation-title">{$t("donate.card.monthly")}</div>
            <div class="donation-subtitle">
                {$t("donate.card.processor.liberapay")}
            </div>
        </button>
    </div>
    <div id="donation-options">
        <DonationOption price={5} desc={$t("donate.card.option.5")} {send}>
            <IconCup />
        </DonationOption>
        <DonationOption price={10} desc={$t("donate.card.option.10")} {send}>
            <IconPizza />
        </DonationOption>
        <DonationOption price={15} desc={$t("donate.card.option.15")} {send}>
            <IconToolsKitchen2 />
        </DonationOption>
        <DonationOption price={30} desc={$t("donate.card.option.30")} {send}>
            <IconToolsKitchen2 />
        </DonationOption>
    </div>
    <div id="donation-custom">
        <div id="input-container" class:focused={customFocused}>
            {#if customInputValue || customInput?.validity.badInput}
                <span id="input-dollar-sign">$</span>
            {/if}
            <input
                id="donation-custom-input"
                type="number"
                min="2"
                max="10000"
                step=".01"
                required
                placeholder={$t("donate.card.custom")}
                bind:this={customInput}
                bind:value={customInputValue}
                on:input={() => (customFocused = true)}
                on:focus={() => (customFocused = true)}
                on:blur={() => (customFocused = false)}
                on:keydown={(e) => e.key === "Enter" && sendCustom()}
            />
        </div>
        <button id="donation-custom-submit" on:click={sendCustom}>
            <IconArrowRight />
        </button>
    </div>
    <div class="donation-subtitle processor-mobile">
        {$t(`donate.card.processor.${processor}`)}
    </div>
</div>

<style>
    #donation-box {
        --donation-box-main-padding: var(--donate-border-radius);
        --donation-box-padding: 12px;
        --donation-box-gray-text: #9a9a9a;

        display: flex;
        flex-direction: column;
        width: calc(100% - var(--donation-box-main-padding) * 2);
        max-width: 480px;

        padding: var(--donation-box-main-padding);
        border-radius: var(--donate-border-radius);
        gap: calc(var(--donation-box-main-padding) / 2);

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
        overflow: scroll;
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
        overflow: hidden;
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
        overflow: scroll;
    }

    #input-container {
        padding: 12px 18px;
        width: 100%;
        border-radius: 12px;
        color: var(--white);
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    #input-dollar-sign {
        animation: grow-in 0.05s linear;
        display: block;
    }

    @keyframes grow-in {
        from {
            font-size: 0;
        }
        to {
            font-size: inherit;
        }
    }

    #input-container,
    #donation-custom-input {
        font-size: 13px;
    }

    #donation-custom-input {
        flex: 1;
        background-color: transparent;
        color: var(--white);
        border: none;
        padding-block: 0;
        padding-inline: 0;
        padding: 0;
    }

    #donation-custom-input::placeholder {
        color: var(--donation-box-gray-text);
        opacity: 1;
    }

    #donation-custom-input:focus-visible {
        box-shadow: unset !important;
    }

    #input-container.focused {
        box-shadow: 0 0 0 1.5px var(--blue) inset;
        outline: var(--blue) 0.5px solid;
    }

    #donation-custom-submit {
        color: var(--white);
        background-color: rgba(255, 255, 255, 0.1);
        aspect-ratio: 1/1;
        padding: 0px 10px;
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

    .processor-mobile {
        display: none;
        text-align: center;
        font-size: 13px;
    }

    @media screen and (max-width: 550px) {
        #donation-box {
            --donation-box-main-padding: 18px;
        }

        .donation-title {
            font-size: 14px;
        }

        .donation-type .donation-subtitle {
            display: none;
        }

        .processor-mobile {
            display: block;
        }
    }
</style>
