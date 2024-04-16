<script>
    import IconLink from '@tabler/icons-svelte/IconLink.svelte';

    let inputContainer;
    let link = "";
    let isFocused = false;

    const testLink = (/** @type {string} */ link) => {
        try {
            return /^https?:/i.test(new URL(link).protocol);
        } catch {
            return false
        }
    }
    const pasteClipboard = () => {
        navigator.clipboard.readText().then(text => {
            let matchLink = text.match(/https?:\/\/[^\s]+/g);
            if (matchLink) {
                link = matchLink[0];
            }
        });
    }
</script>

<style>
    #pager {
        display: flex;
        flex-direction: column;
        max-width: 585px;
        width: 100%;
        gap: 14px;
    }
    #input-container {
        display: flex;
        border: var(--gray) 1px solid;
        border-radius: 12px;
        padding: 0 10px;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        flex: 1
    }
    :global(#input-container.focused) {
        outline: var(--accent) 1px solid;
        border: var(--accent) 1px solid;
    }
    :global(#input-container.focused) :global(#input-link-icon) {
        stroke: var(--accent);
    }
    #link-area {
        display: flex;
        width: 100%;
        margin: 0;
        padding: 10px 0;

        align-items: center;

        border: none;
        outline: none;
        background-color: transparent;
        color: var(--accent);

        -webkit-tap-highlight-color: transparent;
        flex: 1;
    }
    #link-area::placeholder {
        color: var(--gray);
    }
    #button-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>

<div id="pager">
    <div id="input-container" class:focused={isFocused} bind:this={inputContainer}>
        <IconLink id="input-link-icon" color="var(--gray)" size="20px"/>
    
        <!-- svelte-ignore a11y-autofocus -->
        <input
            id="link-area"
            bind:value={link}

            on:input={() => isFocused = true}
            on:focus={() => isFocused = true}
            on:blur={() => isFocused = false}

            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="256"

            placeholder="paste the link here"
            aria-label="link input area"

            autofocus>

        {#if link.length > 0}
            <button id="clear-button" on:click={() => link = ""}>✕</button>
        {/if}
        {#if testLink(link)}
            <input
                id="download-button"
                aria-label="download button"
                type="submit"
                value=">>">
        {/if}
    </div>
    <div id="button-container">
        <div id="mode-switcher">
            <button id="auto-mode-button">auto</button>
            <button id="audio-mode-button">audio</button>
        </div>
        <button id="paste-button" on:click={pasteClipboard}>paste</button>
    </div>
</div>