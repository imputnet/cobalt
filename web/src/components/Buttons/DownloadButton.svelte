<style>
    #download-button {
        font-size: 24px;
        letter-spacing: -0.2em;
        text-align: center;
        font-weight: 400;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        border-radius: 0;
        text-indent: -3px;
        padding: 0 13px 0 12px;
        background: none;
        border-left: 1px var(--gray) solid;
        border-top-right-radius: 11px;
        border-bottom-right-radius: 11px;
    }
    #download-button:hover {
        background: var(--button-hover-transparent)
    }
    #download-button:disabled {
        cursor: unset;
    }
    #download-button:disabled:hover {
        background: none;
    }
    :global(#input-container.focused) #download-button {
        border-left: 2px var(--accent) solid;
    }
</style>
<button id="download-button">&gt;&gt;</button>