<script lang="ts">
    import { donate } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import DonateCardContainer from "$components/donate/DonateCardContainer.svelte";
    import DonationOption from "$components/donate/DonationOption.svelte";

    import IconCoin from "@tabler/icons-svelte/IconCoin.svelte";
    import IconCalendarRepeat from "@tabler/icons-svelte/IconCalendarRepeat.svelte";
    import IconCup from "@tabler/icons-svelte/IconCup.svelte";
    import IconPizza from "@tabler/icons-svelte/IconPizza.svelte";
    import IconToolsKitchen2 from "@tabler/icons-svelte/IconToolsKitchen2.svelte";
    import IconPaperBag from "@tabler/icons-svelte/IconPaperBag.svelte";
    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";
    import IconSoup from "@tabler/icons-svelte/IconSoup.svelte";
    import IconFridge from "@tabler/icons-svelte/IconFridge.svelte";
    import IconArmchair from "@tabler/icons-svelte/IconArmchair.svelte";
    import IconDeviceLaptop from "@tabler/icons-svelte/IconDeviceLaptop.svelte";
    import IconApple from "@tabler/icons-svelte/IconApple.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import IconWorldWww from "@tabler/icons-svelte/IconWorldWww.svelte";
    import IconBath from "@tabler/icons-svelte/IconBath.svelte";
    import OuterLink from "$components/misc/OuterLink.svelte";

    let customInput: HTMLInputElement;
    let customInputValue: number | null;
    let customFocused = false;

    const PRESET_DONATION_AMOUNTS = {
        5: IconCup,
        10: IconPizza,
        15: IconSoup,
        30: IconToolsKitchen2,
        50: IconPaperBag,
        100: IconWorldWww,
        200: IconFridge,
        500: IconArmchair,
        1599: IconDeviceLaptop,
        4900: IconApple,
        7398: IconDeviceLaptop,
        8629: IconPhoto,
        9433: IconBath
    };

    type Processor = "stripe" | "liberapay";
    let processor: Processor = "stripe";

    const donationMethods: Record<Processor, (_: number) => string> = {
        stripe: (amount: number) => {
            const url = new URL(donate.stripe);
            url.searchParams.set("__prefilled_amount", amount.toString());
            return url.toString();
        },
        liberapay: (amount: number) => {
            const url = new URL(donate.liberapay);
            url.searchParams.set("currency", "USD");
            url.searchParams.set("period", "monthly");
            url.searchParams.set("amount", (amount / 100).toString());
            return url.toString();
        },
    };

    const sendCustom = () => {
        if (!customInput.reportValidity()) {
            return;
        }

        const amount = Math.floor(Number(customInputValue) * 100);
        return window.open(donationMethods[processor](amount), '_blank');
    };
</script>

<DonateCardContainer id="donation-box">
    <div id="donation-types" role="tablist" aria-orientation="horizontal">
        <button
            id="donation-type-once"
            class="donation-type"
            on:click={() => (processor = "stripe")}
            class:selected={processor === "stripe"}
            aria-selected={processor === "stripe"}
            role="tab"
        >
            <div class="donation-type-icon"><IconCoin /></div>
            <div class="donation-type-text">
                <div class="donate-card-title">{$t("donate.card.once")}</div>
                <div class="donate-card-subtitle">
                    {$t("donate.card.processor", { value: 'stripe' })}
                </div>
            </div>
        </button>
        <button
            id="donation-type-monthly"
            class="donation-type"
            on:click={() => (processor = "liberapay")}
            class:selected={processor === "liberapay"}
            aria-selected={processor === "liberapay"}
            role="tab"
        >
            <div class="donation-type-icon"><IconCalendarRepeat /></div>
            <div class="donation-type-text">
                <div class="donate-card-title">{$t("donate.card.monthly")}</div>
                <div class="donate-card-subtitle">
                    {$t("donate.card.processor", { value: 'liberapay' })}
                </div>
            </div>
        </button>
    </div>
    <div id="donation-options">
        {#each Object.entries(PRESET_DONATION_AMOUNTS) as [ amount, component ]}
            <OuterLink href={donationMethods[processor](+amount * 100)}>
                <DonationOption price={+amount} desc={$t(`donate.card.option.${amount}`)}>
                    <svelte:component this={component} />
                </DonationOption>
            </OuterLink>
        {/each}
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
        <button
            id="donation-custom-submit"
            on:click={sendCustom}
            aria-label={$t("donate.card.custom.submit")}
            type="submit"
        >
            <IconArrowRight />
        </button>
    </div>
    <div class="donate-card-subtitle processor-mobile">
        {$t("donate.card.processor", { value: processor })}
    </div>
</DonateCardContainer>

<style>
    :global(#donation-box) {
        min-width: 300px;
        padding: var(--donate-card-main-padding) 0;
    }

    #donation-types,
    #donation-options,
    #donation-custom {
        padding: 0 var(--donate-card-main-padding);
    }

    #donation-types {
        display: flex;
        flex-direction: row;
        gap: var(--donate-card-padding);
        overflow: scroll;
    }

    .donation-type {
        width: 100%;
        overflow: hidden;
        gap: 2px;
    }

    .donation-type-icon {
        display: flex;
    }

    .donation-type-icon :global(svg) {
        width: 28px;
        height: 28px;
        stroke-width: 1.8px;
    }

    .donation-type-text {
        display: flex;
        flex-direction: column;
    }

    #donation-options {
        display: flex;
        overflow-x: scroll;
        gap: 6px;
        mask-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 4%,
            rgba(0, 0, 0, 1) 50%,
            rgba(0, 0, 0, 1) 96%,
            rgba(0, 0, 0, 0) 100%
        );
    }

    #donation-custom {
        display: flex;
        gap: 6px;
        overflow: scroll;
    }

    #input-container {
        padding: 0 18px;
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
        padding: 12px 0;
        appearance: textfield;
    }

    #donation-custom-input::placeholder {
        color: var(--white);
        opacity: 0.5;
    }

    #donation-custom-input:focus-visible {
        box-shadow: unset !important;
    }

    #input-container.focused {
        box-shadow: 0 0 0 2px var(--white) inset;
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
    }

    @media screen and (max-width: 550px) {
        :global(#donation-box) {
            min-width: unset;
        }

        :global(#donation-box .donate-card-title) {
            font-size: 14px;
        }

        :global(#donation-box .donate-card-subtitle) {
            font-size: 12px;
        }

        .donation-type-icon :global(svg) {
            width: 26px;
            height: 26px;
        }

        .donation-type .donate-card-subtitle {
            display: none;
        }

        .processor-mobile {
            display: block;
        }
    }

    #donation-options > :global(a) {
        text-decoration: none;
    }
</style>
