<script>
    import '@fontsource-variable/noto-sans-mono';
</script>

<button id="download-button">
    <span id="download-state">&gt;&gt;</span>
</button>

<style>
    #download-button {
        display: flex;
        align-items: center;
        justify-content: center;

        height: 100%;
        min-width: 48px;

        border-radius: 0;
        padding: 0 12px;
        background: none;

        border-left: 1px var(--gray) solid;
        border-top-right-radius: 11px;
        border-bottom-right-radius: 11px;
    }

    #download-state {
        font-size: 24px;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono", "IBM Plex Mono", monospace;
        font-weight: 400;

        text-align: center;
        text-indent: -5px;
        letter-spacing: -0.22em;

        margin-bottom: 0.1rem;
    }

    #download-button:hover {
        background: var(--button-hover-transparent);
    }

    #download-button:disabled {
        cursor: unset;
    }

    #download-button:disabled:hover {
        background: none;
    }

    :global(#input-container.focused) #download-button {
        border-left: 2px var(--secondary) solid;
    }
</style>
