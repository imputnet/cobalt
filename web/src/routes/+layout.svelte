<script>
    import "@fontsource/ibm-plex-mono/400.css";
    import "@fontsource/ibm-plex-mono/500.css";
    import Sidebar from "../components/sidebar/Sidebar.svelte";
</script>

<div id="cobalt">
    <Sidebar />
    <div id="content">
        <slot></slot>
    </div>
</div>

<style>
    :global(:root) {
        --primary: #ffffff;
        --secondary: #000000;
        --gray: #8d8d95;

        --button: #eeeeee;
        --button-hover: #e8e8e8;
        --button-hover-transparent: rgba(0, 0, 0, 0.03);
        --button-stroke: rgba(0, 0, 0, 0.08);

        --sidebar-bg: #000000;
        --sidebar-highlight: #ffffff;

        --input-border: #8d8d95;

        --padding: 12px;
        --border-radius: 11px;

        --sidebar-width: 80px;
        --sidebar-height-mobile: 50px;
        --sidebar-font-size: 11px;

        --sidebar-mobile-gradient: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0) 4%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0) 96%,
            rgba(0, 0, 0, 0.9) 100%
        );
    }

    /* temporary switcher until theming is implemented, */
    /* just so my eyes don't burn at night */
    @media (prefers-color-scheme: dark) {
        :global(:root) {
            --primary: #000000;
            --secondary: #e1e1e1;
            --gray: #6e6e6e;

            --button: #191919;
            --button-hover: #2a2a2a;
            --button-hover-transparent: rgba(225, 225, 225, 0.04);
            --button-stroke: rgba(255, 255, 255, 0.08);

            --sidebar-bg: #101010;
            --sidebar-highlight: #f2f2f2;

            --input-border: #383838;

            --sidebar-mobile-gradient: linear-gradient(
                90deg,
                rgba(16, 16, 16, 0.9) 0%,
                rgba(16, 16, 16, 0) 4%,
                rgba(16, 16, 16, 0) 50%,
                rgba(16, 16, 16, 0) 96%,
                rgba(16, 16, 16, 0.9) 100%
            );
        }
    }

    :global(html),
    :global(body) {
        margin: 0;
        background-color: var(--primary);
        color: var(--secondary);
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
    }

    :global(svg),
    :global(img) {
        pointer-events: none;
    }

    :global(button) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 15px;
        gap: 8px;
        border: none;
        border-radius: var(--border-radius);
        font-size: 16px;
        cursor: pointer;
        background-color: var(--button);
        color: var(--secondary);
        box-shadow: 0 0 0 1.5px var(--button-stroke) inset;
    }

    :global(button:focus-visible) {
        box-shadow: 0 0 0 1.5px var(--secondary) inset;
        outline: none;
        z-index: 1;
    }

    :global(button:active) {
        transform: scale(0.95);
    }

    :global(button:hover) {
        background-color: var(--button-hover);
        z-index: 1;
    }

    :global(.center-column-container) {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    #cobalt {
        height: 100vh;
        display: grid;
        grid-template-columns: var(--sidebar-width) 1fr;
        overflow: hidden;
    }

    #content {
        display: flex;
        overflow: scroll;
        padding: var(--padding);
        background-color: var(--primary);
    }

    @media screen and (max-width: 535px) {
        #cobalt {
            display: grid;
            grid-template-columns: unset;
            grid-template-rows: 1fr var(--sidebar-height-mobile);
        }
        #content {
            order: -1;
        }
    }
</style>
