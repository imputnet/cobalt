<script lang="ts">
    import "@fontsource/redaction-10/400.css";

    import { t } from "$lib/i18n/translations";

    import Imput from "$components/icons/Imput.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";

    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
</script>

<header id="banner">
    <div id="banner-contents">
        <div id="banner-left">
            <div id="imput-logo">
                <Imput />
            </div>
            <div
                id="banner-title"
                class="redaction"
                tabindex="-1"
                data-first-focus
                data-focus-ring-hidden
            >
                {$t("donate.banner.title")}
            </div>
            <div id="banner-subtitle">{$t("donate.banner.subtitle")}</div>
        </div>
        <div id="banner-right">
            <Meowbalt emotion="fast" />
        </div>
    </div>
    <div id="banner-background">
        <div id="banner-background-animation">
            <div id="banner-background-inner">
            </div>
        </div>
    </div>
</header>

<style>
    #banner {
        position: relative;
        border-radius: var(--donate-border-radius);
        background: linear-gradient(
            180deg,
            var(--donate-gradient-start) 30%,
            var(--donate-gradient-end) 100%
        );
        box-shadow: 0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity))
            inset;
    }

    #banner-contents {
        position: relative;
        display: flex;
        width: 100%;
    }

    #banner-background {
        position: absolute;
        pointer-events: none;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        opacity: 8%;
        border-radius: var(--donate-border-radius);
        mask-image: linear-gradient(
            150deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(255, 255, 255, 0) 65%
        );
    }

    #banner-background-inner {
        color: white;
        transform: rotate(-10deg) scale(1.5) translateY(-70px);
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="42" height="40" viewBox="2 7 21 10" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path></svg>');
        background-repeat: repeat;
        width: 800px;
        height: 400px;
    }

    #banner-background-inner :global(.heart-icon) {
        height: 48px;
        width: 48px;
        stroke-width: 1.5px;
        margin: -6px -2.5px;
    }

    #banner-right :global(.meowbalt) {
        height: 330px;
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
        display: flex;
    }

    #imput-logo :global(svg) {
        width: 48px;
        height: 42px;
    }

    #banner-left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
        padding: 48px;
        padding-right: 0;
        gap: 14px;
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
        color: var(--white);
        opacity: 0.4;
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
            transform: translateX(83px) translateY(107px);
        }
    }

    @media screen and (max-width: 1000px) {
        #banner-right {
            transform: translate(-4px, 44px);
        }
    }

    @media screen and (max-width: 990px) {
        #banner-right :global(.meowbalt) {
            height: 300px;
        }
    }

    @media screen and (max-width: 960px) {
        #banner-right :global(.meowbalt) {
            height: 280px;
        }

        #banner-right {
            transform: translate(-4px, 30px);
        }
    }

    @media screen and (max-width: 930px) {
        #banner-right :global(.meowbalt) {
            height: 260px;
        }

        #banner-right {
            transform: translate(-4px, 20px);
        }
    }

    @media screen and (max-width: 900px) {
        #banner-right :global(.meowbalt) {
            height: 230px;
        }

        #banner-right {
            transform: translate(-10px, 15px);
        }
    }

    @media screen and (max-width: 865px) {
        #banner-right {
            display: none;
        }

        #banner-left {
            max-width: 100%;
            padding: 55px;
        }

        #banner-background {
            mask-image: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.5) 0%,
                rgba(255, 255, 255, 0) 90%
            );
        }

        #banner-contents {
            justify-content: center;
        }

        #banner-left {
            padding: 45px 12px;
            gap: 14px;
            align-items: center;
        }

        #banner-title,
        #banner-subtitle {
            text-align: center;
        }
    }

    @media screen and (max-width: 610px) {
        #banner-title {
            font-size: 40px;
        }
    }

    @media screen and (max-width: 550px) {
        #banner-left {
            padding: 32px 12px;
            gap: 12px;
        }

        #banner-title {
            font-size: 36px;
        }

        #banner-subtitle {
            font-size: 14px;
        }
    }
</style>
