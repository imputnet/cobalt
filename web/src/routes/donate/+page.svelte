<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { t } from "$lib/i18n/translations";
    import { donate } from "$lib/env";

    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";

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
    <header id="banner">
        <div id="banner-contents">
            <div id="banner-left">
                <img id="imput-logo" src="/icons/imput.svg" alt="imput logo" />
                <div id="banner-title">{$t('donate.title')}</div>
                <div id="banner-subtitle">{$t('donate.subtitle')}</div>
            </div>
            <div id="banner-right">
                <Meowbalt emotion="fast" />
            </div>
        </div>
        <div id="banner-background">
            <div id="banner-background-animation">
                <div id="banner-background-inner">
                    {#each {length: 144} as _}
                        <IconHeart class="heart-icon" />
                    {/each}
                </div>
            </div>
        </div>
    </header>
</main>

<style>
    #donate-page {
        max-width: 950px;
        margin: 0 auto;
        overflow-x: hidden;
        padding: var(--padding);
    }

    #banner {
        position: relative;
        border-radius: calc(3 * var(--border-radius));
        background: linear-gradient(
            190deg,
            #1a1a1a 30%,
            #3c3c3c 100%
        );
    }

    #banner-contents {
        position: relative;
        display: flex;
        width: 100%;
        z-index: 2;
    }

    #banner-background {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        opacity: 10%;
        mask-image: linear-gradient(
            145deg,
            rgba(0,0,0,1) 0%,
            rgba(255,255,255,0) 60%
        );
    }

    #banner-background-inner {
        color: white;
        transform: rotate(-8deg) scale(1.5) translateY(-4em);
    }

    #banner-background-inner :global(.heart-icon) {
        height: 3em;
        width: 3em;
        stroke-width: 1.5px;
        margin: -.15em;
    }

    #banner-right :global(.meowbalt) {
        height: 40vmin;
        margin-top: -2em;
        margin-left: -4em;
    }

    #banner-right {
        transform: translate(12px, 48px);
        display: flex;
        align-items: center;
    }

    #imput-logo {
        width: 3em;
    }

    #banner-left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2.5em 3.5em;
        color: white;
        gap: 1em;
        white-space: pre-wrap;
    }

    #banner-title {
        font-family: 'Redaction 10', serif;
        font-size: 3em;
        font-weight: 400;
        line-height: 0.95;
    }

    #banner-subtitle {
        color: var(--gray);
    }
    #banner-background-animation {
        animation: heart-move 5s infinite linear;
    }

    @keyframes heart-move {
        from {
            transform: translateX(0) translateY(0);
        }

        to {
            transform: translate(74px) translateY(61px);
        }
    }
</style>
