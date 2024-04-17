<script>
    import IconLink from '@tabler/icons-svelte/IconLink.svelte';
    import Button from '../Buttons/Button.svelte';
    import ClearButton from '../Buttons/ClearButton.svelte';
    import DownloadButton from '../Buttons/DownloadButton.svelte';

    let inputContainer;
    let link = "";
    let isFocused = false;

    const validLink = (link) => {
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
        gap: 10px;
        font-size: 14px;
        flex: 1
    }
    #input-container.downloadable {
        padding-right: 0;
    }
    #input-container.focused {
        outline: var(--accent) 1px solid;
        border: var(--accent) 1px solid;
    }
    #input-container.focused :global(#input-link-icon) {
        stroke: var(--accent);
    }
    #link-area {
        display: flex;
        width: 100%;
        margin: 0;
        padding: 10px 0;
        height: 20px;

        align-items: center;

        border: none;
        outline: none;
        background-color: transparent;
        color: var(--accent);

        -webkit-tap-highlight-color: transparent;
        flex: 1;

        /* workaround for safari */
        font-size: inherit;
    }
    #button-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    #mode-switcher {
        display: flex;
    }
</style>

<div id="pager">
    <div id="input-container" class:focused={isFocused} class:downloadable={validLink(link)} bind:this={inputContainer}>
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
            <ClearButton click={() => link = ""} />
        {/if}
        {#if validLink(link)}
            <DownloadButton />
        {/if}
    </div>
    <div id="button-container">
        <div id="mode-switcher">
            <button id="auto-mode-button">
                auto
            </button>
            <button id="audio-mode-button">
                audio
            </button>
        </div>
        <Button
            id="paste-button"
            click={pasteClipboard}
            text="paste"
        />
    </div>
</div>