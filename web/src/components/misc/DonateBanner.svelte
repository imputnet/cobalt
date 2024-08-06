<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { t } from "$lib/i18n/translations";
    import Meowbalt from "$components/misc/Meowbalt.svelte";

    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
</script>

<header id="banner">
    <div id="banner-contents">
        <div id="banner-left">
            <img id="imput-logo" src="/icons/imput.svg" alt="imput logo" />
            <div id="banner-title" class="redaction">{$t("donate.title")}</div>
            <div id="banner-subtitle">{$t("donate.subtitle")}</div>
        </div>
        <div id="banner-right">
            <Meowbalt emotion="fast" />
        </div>
    </div>
    <div id="banner-background">
        <div id="banner-background-animation">
            <div id="banner-background-inner">
                {#each { length: 160 } as _}
                    <IconHeart class="heart-icon" />
                {/each}
            </div>
        </div>
    </div>
</header>

<style>
    #banner {
        --banner-radius: 28px;
        position: relative;
        border-radius: var(--banner-radius);
        background: linear-gradient(180deg, #1a1a1a 30%, #404040 100%);
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
        opacity: 8%;
        border-radius: var(--banner-radius);
        mask-image: linear-gradient(
            150deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(255, 255, 255, 0) 65%
        )
    }

    #banner-background-inner {
        color: white;
        transform: rotate(-10deg) scale(1.5) translateY(-70px);
    }

    #banner-background-inner :global(.heart-icon) {
        height: 48px;
        width: 48px;
        stroke-width: 1.5px;
        margin: -6px -2.5px;
    }

    #banner-right :global(.meowbalt) {
        height: 38vmin;
    }

    #banner-right {
        transform: translate(12px, 44px);
        display: flex;
        align-items: center;
        position: absolute;
        right: 0;
        bottom: 0;
    }

    #imput-logo {
        width: 48px;
    }

    #banner-left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
        padding: 55px;
        padding-right: 0;
        gap: 16px;
        white-space: pre-wrap;
        max-width: 55%;
    }

    #banner-title {
        font-family: serif;
        font-size: 48px;
        font-weight: 400;
        line-height: 0.95;
    }

    #banner-title.redaction {
        font-family: "Redaction 10", serif;
        font-smooth: never;
        -webkit-font-smoothing: none;
    }

    #banner-subtitle {
        color: var(--gray);
        line-height: 1.5;
        font-size: 16px;
    }

    #banner-background-animation {
        animation: heart-move 6s infinite linear;
    }

    @keyframes heart-move {
        from {
            transform: translateX(0) translateY(0);
        }

        to {
            transform: translate(85px) translateY(108px);
        }
    }
</style>
