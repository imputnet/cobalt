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

        --padding: 12px;
        --border-radius: 11px;

        --sidebar-width: 80px;
        --sidebar-height-mobile: 50px;
        --sidebar-font-size: 11px;
    }

    :global(html),
    :global(body) {
        margin: 0;
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

    :global(button:active) {
        transform: scale(0.95);
    }

    :global(button:hover) {
        background-color: var(--button-hover);
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
