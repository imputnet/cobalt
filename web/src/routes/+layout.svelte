<script lang="ts">
    import "@fontsource/ibm-plex-mono/400.css";
    import "@fontsource/ibm-plex-mono/400-italic.css";
    import "@fontsource/ibm-plex-mono/500.css";

    import { page } from "$app/stores";
    import { updated } from "$app/stores";
    import { browser } from "$app/environment";
    import { afterNavigate } from "$app/navigation";

    import env from "$lib/env";
    import settings from "$lib/state/settings";
    import locale from "$lib/i18n/locale";

    import { t } from "$lib/i18n/translations";

    import { device, app } from "$lib/device";
    import { turnstileCreated } from "$lib/state/turnstile";
    import currentTheme, { statusBarColors } from "$lib/state/theme";

    import Sidebar from "$components/sidebar/Sidebar.svelte";
    import Turnstile from "$components/misc/Turnstile.svelte";
    import NotchSticker from "$components/misc/NotchSticker.svelte";
    import DialogHolder from "$components/dialog/DialogHolder.svelte";
    import UpdateNotification from "$components/misc/UpdateNotification.svelte";

    $: reduceMotion =
        $settings.appearance.reduceMotion || device.prefers.reducedMotion;
    $: reduceTransparency =
        $settings.appearance.reduceTransparency ||
        device.prefers.reducedTransparency;

    afterNavigate(() => {
        const to_focus: HTMLElement | null =
            document.querySelector("[data-first-focus]");
        to_focus?.focus();
    });
</script>

<svelte:head>
    <meta name="description" content={$t("general.embed.description")}>
    <meta property="og:description" content={$t("general.embed.description")}>

    {#if env.HOST}
        <meta property="og:url" content="https://{env.HOST}{$page.url.pathname}">
    {/if}

    {#if device.is.mobile}
        <meta name="theme-color" content={statusBarColors[$currentTheme]} />
    {/if}

    {#if env.PLAUSIBLE_ENABLED}
        <script
            defer
            data-domain={env.HOST}
            src="https://{env.PLAUSIBLE_HOST}/js/script.js"
        >
        </script>
    {/if}
</svelte:head>

<div style="display: contents" data-theme={browser ? $currentTheme : undefined} lang={$locale}>
    <div
        id="cobalt"
        class:loaded={browser}
        data-iphone={device.is.iPhone}
        data-reduce-motion={reduceMotion}
        data-reduce-transparency={reduceTransparency}
    >
        {#if $updated}
            <UpdateNotification />
        {/if}
        {#if device.is.iPhone && app.is.installed}
            <NotchSticker />
        {/if}
        <DialogHolder />
        <Sidebar />
        <div id="content">
            {#if (env.TURNSTILE_KEY && $page.url.pathname === "/") || $turnstileCreated}
                <Turnstile />
            {/if}
            <slot></slot>
        </div>
    </div>
</div>

<style>
    :global(:root) {
        --primary: #ffffff;
        --secondary: #000000;

        --white: #ffffff;
        --gray: #75757e;

        --red: #ed2236;
        --dark-red: #d61c2e;
        --green: #51cf5e;
        --blue: #2f8af9;

        --button: #f4f4f4;
        --button-hover: #e8e8e8;
        --button-active-hover: #2a2a2a;
        --button-hover-transparent: rgba(0, 0, 0, 0.06);
        --button-stroke: rgba(0, 0, 0, 0.06);
        --button-text: #282828;
        --button-box-shadow: 0 0 0 1.5px var(--button-stroke) inset;

        --button-elevated: #e3e3e3;
        --button-elevated-hover: #dadada;
        --button-elevated-shimmer: #ededed;

        --popup-bg: #f1f1f1;
        --popup-stroke: rgba(0, 0, 0, 0.08);

        --dialog-backdrop: rgba(255, 255, 255, 0.3);

        --sidebar-bg: #000000;
        --sidebar-highlight: #ffffff;
        --sidebar-hover: rgba(255, 255, 255, 0.1);

        --input-border: #adadb7;

        --toggle-bg: var(--input-border);
        --toggle-bg-enabled: var(--secondary);

        --padding: 12px;
        --border-radius: 11px;

        --sidebar-width: 80px;
        --sidebar-font-size: 11px;
        --sidebar-inner-padding: 4px;
        --sidebar-height-mobile: calc(
            50px + calc(var(--sidebar-inner-padding) * 2) +
                env(safe-area-inset-bottom)
        );

        --safe-area-inset-top: env(safe-area-inset-top);

        --switcher-padding: var(--sidebar-inner-padding);

        /* used for fading the tab bar on scroll */
        --sidebar-mobile-gradient: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0) 4%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0) 96%,
            rgba(0, 0, 0, 0.9) 100%
        );

        --skeleton-gradient: linear-gradient(
            90deg,
            var(--button-hover),
            var(--button),
            var(--button-hover)
        );

        --skeleton-gradient-elevated: linear-gradient(
            90deg,
            var(--button-elevated),
            var(--button-elevated-shimmer),
            var(--button-elevated)
        );
    }

    :global([data-theme="dark"]) {
        --primary: #000000;
        --secondary: #e1e1e1;

        --gray: #818181;

        --blue: #2a7ce1;
        --green: #37aa42;

        --button: #191919;
        --button-hover: #2a2a2a;
        --button-active-hover: #f9f9f9;
        --button-hover-transparent: rgba(225, 225, 225, 0.1);
        --button-stroke: rgba(255, 255, 255, 0.05);
        --button-text: #e1e1e1;
        --button-box-shadow: 0 0 0 1.5px var(--button-stroke) inset;

        --button-elevated: #282828;
        --button-elevated-hover: #323232;

        --popup-bg: #191919;
        --popup-stroke: rgba(255, 255, 255, 0.08);

        --dialog-backdrop: rgba(0, 0, 0, 0.3);

        --sidebar-bg: #101010;
        --sidebar-highlight: #f2f2f2;

        --input-border: #383838;

        --toggle-bg: var(--input-border);
        --toggle-bg-enabled: #777777;

        --sidebar-mobile-gradient: linear-gradient(
            90deg,
            rgba(16, 16, 16, 0.9) 0%,
            rgba(16, 16, 16, 0) 4%,
            rgba(16, 16, 16, 0) 50%,
            rgba(16, 16, 16, 0) 96%,
            rgba(16, 16, 16, 0.9) 100%
        );

        --skeleton-gradient: linear-gradient(
            90deg,
            var(--button),
            var(--button-hover),
            var(--button)
        );

        --skeleton-gradient-elevated: linear-gradient(
            90deg,
            var(--button-elevated),
            var(--button-elevated-hover),
            var(--button-elevated)
        );
    }

    :global([data-theme="light"] [data-reduce-transparency="true"]) {
        --dialog-backdrop: rgba(255, 255, 255, 0.6);
    }

    :global([data-theme="dark"] [data-reduce-transparency="true"]) {
        --dialog-backdrop: rgba(0, 0, 0, 0.5);
    }

    :global(html),
    :global(body) {
        margin: 0;
        height: 100vh;
        overflow: hidden;
        overscroll-behavior-y: none;
    }

    #cobalt {
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns:
            calc(var(--sidebar-width) + var(--sidebar-inner-padding) * 2)
            1fr;
        overflow: hidden;
        background-color: var(--sidebar-bg);
        color: var(--secondary);
        position: fixed;
    }

    /* add padding for notch / dynamic island in landscape */
    @media screen and (orientation: landscape) {
        #cobalt[data-iphone="true"] {
            grid-template-columns:
                calc(
                    var(--sidebar-width) + var(--sidebar-inner-padding) * 2 +
                        env(safe-area-inset-left)
                )
                1fr;
        }

        #cobalt[data-iphone="true"] #content {
            padding-right: env(safe-area-inset-right);
        }
    }

    #content {
        display: flex;
        overflow: scroll;
        background-color: var(--primary);

        border-top-left-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);
    }

    @media screen and (max-width: 535px) {
        #cobalt {
            display: grid;
            grid-template-columns: unset;
            grid-template-rows: 1fr var(--sidebar-height-mobile);
        }
        #content {
            padding-top: env(safe-area-inset-top);
            order: -1;
            border-top-left-radius: 0;
            border-bottom-left-radius: calc(var(--border-radius) * 2);
            border-bottom-right-radius: calc(var(--border-radius) * 2);
        }
    }

    :global(*) {
        font-family: "IBM Plex Mono", "Noto Sans Mono Variable",
            "Noto Sans Mono", monospace;
        user-select: none;
        scrollbar-width: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
        -webkit-tap-highlight-color: transparent;
    }

    :global(::-webkit-scrollbar) {
        display: none;
    }

    :global(a) {
        color: inherit;
        text-underline-offset: 3px;
        -webkit-touch-callout: none;
    }

    :global(a:visited) {
        color: inherit;
    }

    :global(svg),
    :global(img) {
        pointer-events: none;
    }

    :global(button, .button) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 13px;
        gap: 6px;
        border: none;
        border-radius: var(--border-radius);
        font-size: 14.5px;
        cursor: pointer;
        background-color: var(--button);
        color: var(--button-text);
        box-shadow: var(--button-box-shadow);
    }

    :global(:focus-visible) {
        box-shadow: 0 0 0 2px var(--blue) inset !important;
        outline: none;
        z-index: 1;
    }

    :global([data-focus-ring-hidden]:focus-visible) {
        box-shadow: none !important;
    }

    :global(button:active, .button:active) {
        background-color: var(--button-hover);
    }

    :global(.button.elevated) {
        background-color: var(--button-elevated);
    }

    :global(.button.elevated:not(.color):active) {
        background-color: var(--button-elevated-hover);
    }

    :global(.button.elevated:not(:focus-visible)) {
        box-shadow: none;
    }

    :global(.button.active) {
        color: var(--primary);
        background-color: var(--secondary);
    }

    :global(.button.active:not(.color):active) {
        background-color: var(--button-active-hover);
    }

    :global(button[disabled]) {
        cursor: default;
    }

    /* important is used because active class is toggled by state */
    /* and added to the end of the list, taking priority */
    :global(.active:focus-visible) {
        color: var(--sidebar-highlight) !important;
        background-color: var(--blue) !important;
    }

    /* workaround for typing into inputs being ignored on iPadOS 15 */
    :global(input) {
        user-select: text;
        -webkit-user-select: text;
    }

    @media (hover: hover) {
        :global(button:hover) {
            background-color: var(--button-hover);
        }

        :global(.button.elevated:not(.color):hover) {
            background-color: var(--button-elevated-hover);
        }

        :global(.button.active:not(.color):hover) {
            background-color: var(--button-active-hover);
        }
    }

    :global(.center-column-container) {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    :global(button) {
        font-weight: 500;
    }

    :global(h1, h2, h3, h4, h5, h6) {
        font-weight: 500;
        margin-block: 0;
    }

    :global(h1) {
        font-size: 24px;
        letter-spacing: -1px;
    }

    :global(h2) {
        font-size: 20px;
        letter-spacing: -1px;
    }

    :global(h3) {
        font-size: 16px;
    }

    :global(h4) {
        font-size: 14.5px;
    }

    :global(h5) {
        font-size: 12px;
    }

    :global(h6) {
        font-size: 11px;
    }

    :global(.subtext) {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--gray);
        line-height: 1.4;
        padding: 0 var(--padding);
        white-space: pre-line;
        user-select: text;
        -webkit-user-select: text;
    }

    :global(.long-text-noto),
    :global(.long-text-noto *:not(h1, h2, h3, h4, h5, h6)) {
        line-height: 1.7;
        font-size: 14.5px;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono", monospace;
        user-select: text;
        -webkit-user-select: text;
    }

    :global(.long-text-noto),
    :global(.long-text-noto *:not(h1, h2, h3, h4, h5, h6, strong, em, del)) {
        font-weight: 410;
    }

    :global(.long-text-noto ul) {
        padding-inline-start: 30px;
    }

    :global(.long-text-noto li) {
        padding-left: 3px;
    }

    :global(.long-text-noto h3) {
        font-size: 17px;
    }

    :global(.long-text-noto.about section p:first-of-type) {
        margin-block-start: 0.3em;
    }

    @media screen and (max-width: 535px) {
        :global(.long-text-noto),
        :global(.long-text-noto *:not(h1, h2, h3, h4, h5, h6)) {
            font-size: 14px;
        }
    }

    [data-reduce-motion="true"] :global(*) {
        animation: none !important;
        transition: none !important;
    }
</style>
