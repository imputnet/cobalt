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
        --accent: #ffffff;
        --background: #000000;
        --sidebar-width: 80px;
        --sidebar-font-size: 11px;
        --sidebar-padding: 12px;
    }

    :global(html),
    :global(body) {
        font-family: "IBM Plex Mono", "Noto Sans Mono", monospace;
        margin: 0;
    }

    :global(a) {
        text-decoration: none;
        text-decoration-line: none;
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
</style>
