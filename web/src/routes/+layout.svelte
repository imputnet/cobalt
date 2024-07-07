<script>
    import "@fontsource/ibm-plex-mono/400.css";
    import "@fontsource/ibm-plex-mono/500.css";

    import { device, app } from "$lib/device";
    import currentTheme, { statusBarColors } from "$lib/state/theme";

    import Sidebar from "$components/sidebar/Sidebar.svelte";
    import NotchSticker from "$components/misc/NotchSticker.svelte";
</script>

<svelte:head>
    {#if device.is.mobile}
        <meta name="theme-color" content={statusBarColors[$currentTheme]}>
    {/if}
</svelte:head>

<div style="display: contents" data-theme={$currentTheme}>
    <div id="cobalt" class:on-iPhone={device.is.iPhone}>
        {#if device.is.iPhone && app.is.installed}
            <NotchSticker />
        {/if}
        <Sidebar />
        <div id="content">
            <slot></slot>
        </div>
    </div>
</div>

<style>
    :global(:root) {
        --primary: #ffffff;
        --secondary: #000000;

        --white: #ffffff;
        --gray: #8d8d95;
        --blue: #2f8af9;
        --green: #51cf5e;

        --button: #f4f4f4;
        --button-hover: #e8e8e8;
        --button-hover-transparent: rgba(0, 0, 0, 0.06);
        --button-stroke: rgba(0, 0, 0, 0.05);
        --button-text: #282828;
        --button-box-shadow: 0 0 0 1.5px var(--button-stroke) inset;

        --sidebar-bg: #000000;
        --sidebar-highlight: #ffffff;
        --sidebar-hover: rgba(255, 255, 255, 0.1);

        --input-border: #adadb7;

        --toggle-bg: var(--input-border);
        --toggle-bg-enabled: var(--secondary);

        --padding: 12px;
        --border-radius: 11px;

        --sidebar-width: 80px;
        --sidebar-height-mobile: calc(52px + env(safe-area-inset-bottom));
        --sidebar-font-size: 11px;
        --sidebar-inner-padding: 4px;

        --safe-area-inset-top: env(safe-area-inset-top);

        --switcher-padding: var(--sidebar-inner-padding);

        --sidebar-mobile-gradient: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0) 4%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0) 96%,
            rgba(0, 0, 0, 0.9) 100%
        );
    }

    :global([data-theme=dark]) {
        --primary: #000000;
        --secondary: #e1e1e1;

        --gray: #6e6e6e;
        --blue: #2a7ce1;
        --green: #37aa42;

        --button: #191919;
        --button-hover: #2a2a2a;
        --button-hover-transparent: rgba(225, 225, 225, 0.1);
        --button-stroke: rgba(255, 255, 255, 0.05);
        --button-text: #e1e1e1;
        --button-box-shadow: 0 0 0 1.5px var(--button-stroke) inset;

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
    }

    :global(html),
    :global(body) {
        margin: 0;
        height: 100vh;
        overflow: hidden;
        overscroll-behavior-y: none;
    }

    #cobalt {
        position: fixed;
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: calc(var(--sidebar-width) + 8px) 1fr;
        overflow: hidden;
        background-color: var(--sidebar-bg);
        color: var(--secondary);
    }

    /* add padding for notch / dynamic island in landscape */
    @media screen and (orientation: landscape) {
        #cobalt.on-iPhone {
            grid-template-columns:
                calc(var(--sidebar-width) + env(safe-area-inset-left) + 8px) 1fr;
        }

        #cobalt.on-iPhone #content {
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
            grid-template-rows: 1fr calc(var(--sidebar-height-mobile) + 8px);
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
        font-family: "IBM Plex Mono", "Noto Sans Mono Variable", "Noto Sans Mono", monospace;
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
        text-decoration: none;
        text-decoration-line: none;
        -webkit-touch-callout: none;
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
        box-shadow: 0 0 0 2px var(--blue) inset;
        outline: none;
        z-index: 1;
    }

    :global(button:active, .button:active) {
        background-color: var(--button-hover);
    }

    :global(.button.active) {
        background: var(--secondary);
        color: var(--primary);
    }

    /* important is used because active class is toggled by state */
    /* and added to the end of the list, taking priority */
    :global(.active:focus-visible) {
        background: var(--blue) !important;
        color: var(--sidebar-highlight) !important;
    }

    @media (hover: hover) {
        :global(button:hover) {
            background-color: var(--button-hover);
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
        font-size: 12px;
        color: var(--gray);
        line-height: 1.4;
        padding: 0 var(--padding);
        white-space: pre-line;
    }
</style>
