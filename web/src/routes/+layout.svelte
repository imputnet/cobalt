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
        --button-hover: rgb(215, 215, 215);
        --button-hover-transparent: rgba(215, 215, 215, 0.5);
        --button-stroke: rgba(0, 0, 0, 0.8);

        --padding: 12px;

        --sidebar-width: 80px;
        --sidebar-font-size: 11px;
    }

    :global(html),
    :global(body) {
        margin: 0;
    }

    :global(*) {
        font-family: "IBM Plex Mono", "Noto Sans Mono Variable", "Noto Sans Mono", monospace;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        -webkit-user-select: none;
        -webkit-user-drag: none;
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
        padding: 7px 13px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: var(--button);
        color: var(--secondary);
    }

    :global(button:hover) {
        background-color: var(--button-hover);
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
    }
    @media screen and (max-width: 535px) {
        #cobalt {
            display: grid;
            grid-template-columns: unset;
            grid-template-rows: 1fr var(--sidebar-width);
        }
        #content {
            order: -1;
        }
    }
</style>
