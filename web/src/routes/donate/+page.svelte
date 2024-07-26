<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { donate } from "$lib/env";

    import IconCoin from "@tabler/icons-svelte/IconCoin.svelte";
    import IconCoffee from "@tabler/icons-svelte/IconCoffee.svelte";
    import IconPizza from "@tabler/icons-svelte/IconPizza.svelte";
    import IconQuestionMark from "@tabler/icons-svelte/IconQuestionMark.svelte";
    import IconRepeat from "@tabler/icons-svelte/IconRepeat.svelte";
    import IconWallet from "@tabler/icons-svelte/IconWallet.svelte";

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
    <h1>support cobalt</h1>
    <p>
        cobalt doesn't shove ads in your face and doesn't sell your personal data, meaning that
        it's <em>completely free to use</em> for everyone. but development and maintenance of a media-heavy
        service used by over 1 million people is quite costly. both in terms of time and money.
    </p>

    <p>
        if cobalt helped you in the past and you want to keep it growing and evolving, you can
        return the favor by making a donation!
    </p>

    <p>
        your donation will help all cobalt users: educators, students, content creators, artists,
        musicians, and many, many more!
    </p>

    <p>
        in past, donations have let cobalt:
    </p>
    <ul>
        <li>increase stability and uptime to nearly 100%.</li>
        <li>speed up ALL downloads, especially heavier ones.</li>
        <li>open the api for free public use.</li>
        <li>withstand several huge user influxes with 0 downtime.</li>
        <li>add resource-intensive features (such as gif conversion).</li>
        <li>continue improving our infrastructure.</li>
        <li>keep developers happy.</li>
    </ul>

    <p>
        <em>every cent matters and is extremely appreciated</em>, you can truly make a difference!
    </p>
    <p>
        if you can't donate, share cobalt with a friend! we don't get ads anywhere, so cobalt
        is spread by word of mouth.
    </p>
    <p>
        sharing is the easiest way to help achieve the goal of better internet for everyone.
    </p>

    <section>
        <h3><IconCoin /> make a one-time donation via stripe</h3>
        <div class="donation-options">
            <button
                class="donation-option"
                on:click={() => donateStripe(500)}
            >
                <h3 class="amount">$5</h3>
                <div class="donate-description">
                    <IconCoffee class="description-icon" />
                    <p>a cup of coffee</p>
                </div>
            </button>
            <button
                class="donation-option"
                on:click={() => donateStripe(1000)}
            >
                <h3 class="amount">$10</h3>
                <div class="donate-description">
                    <IconPizza class="description-icon" />
                    <p>a pizza</p>
                </div>
            </button>
            <button
                class="donation-option"
                on:click={(e) => {
                    if (e.target !== customAmountOnceInput) {
                        if (!customAmountOnceInput.reportValidity()) {
                            return;
                        }

                        const amount = Number(customAmountOnceInput.value);
                        donateStripe(amount * 100);
                    }
                }}
            >
                <h3 class="amount" id="donation-custom">
                    $ <input
                        type="number"
                        placeholder="20"
                        min="2"
                        max="10000"
                        required
                        bind:this={customAmountOnceInput}
                    >
                </h3>
                <div class="donate-description">
                    <IconQuestionMark class="description-icon" />
                    <p>whatever you like!</p>
                </div>
            </button>
        </div>
    </section>

    <section>
        <h3><IconRepeat /> make a recurring donation via liberapay</h3>
        <div class="donation-options">
            <button
                class="donation-option"
                on:click={() => donateLibera(200)}
            >
                <h3 class="amount">$2/month</h3>
                <div class="donate-description">
                    <p>idk</p>
                </div>
            </button>
            <button
                class="donation-option"
                on:click={() => donateLibera(500)}
            >
                <h3 class="amount">$5/month</h3>
                <div class="donate-description">
                    <IconCoffee class="description-icon" />
                    <p>a cup of coffee</p>
                </div>
            </button>
            <button
                class="donation-option"
                on:click={(e) => {
                    if (e.target !== customAmountRecurringInput) {
                        if (!customAmountRecurringInput.reportValidity()) {
                            return;
                        }

                        const amount = Number(customAmountRecurringInput.value);
                        donateLibera(amount * 100);
                    }
                }}
            >
                <h3 class="amount" id="donation-custom">
                    $ <input
                        type="number"
                        placeholder="10"
                        min="5"
                        max="1000"
                        required
                        bind:this={customAmountRecurringInput}
                    >
                </h3>
                <div class="donate-description">
                    <IconQuestionMark class="description-icon" />
                    <p>whatever you like!</p>
                </div>
            </button>
        </div>
    </section>

    <section>
        <h3><IconWallet /> donate with cryptocurrencies</h3>
        <div class="crypto-wallets">
            {#each Object.entries(donate.crypto) as [ name, address ]}
                <div class="wallet">
                    <div class="wallet-name">{ name } (press to copy)</div>
                    <button
                        class="wallet-address"
                        on:click={() => toClipboard(address)}
                    >
                        { address }
                    </button>
                </div>
            {/each}
        </div>
    </section>
</main>

<style>
    #donate-page {
        max-width: 850px;
        margin: 0 auto;
        overflow-x: hidden;
        padding: var(--padding);
    }

    em {
        font-style: italic;
        border-bottom: 2px dotted var(--secondary);
    }

    section h3 > :global(*) {
        vertical-align: middle;
    }

    section > h3 {
        padding: var(--padding) 0;
    }

    .donation-options {
        display: flex;
        justify-content: space-evenly;
    }

    @media screen and (max-width: 750px) {
        .donation-options {
            flex-direction: column;
            gap: 1em;
            align-items: center;
        }
    }
    .donation-option {
        display: flex;
        flex-direction: column;
        width: 15rem;
        padding: 1em;
    }

    .amount {
        font-size: 2em;
    }

    .donate-description {
        color: var(--gray);
        padding-top: .5em;
    }

    .donate-description p {
        margin: 0;
    }

    #donation-custom {
        display: flex;
    }

    #donation-custom input {
        background: transparent;
        font-size: inherit;
        border: none;
        border-bottom: 4px dotted var(--secondary);
        width: 2.5em;
        text-align: center;
        appearance: textfield;
        color: var(--secondary);
    }

    .wallet-address {
        width: 100%;
        display: block;
        text-align: left;
        font-size: .75em;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .crypto-wallets {
        display: flex;
        flex-direction: column;
        gap: 1em;
        padding-left: calc(2 * var(--padding));
    }

    .wallet {
        display: flex;
        flex-direction: column;
        gap: .25em;
    }


    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
