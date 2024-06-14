<script lang="ts">
    import { IconLink } from '@tabler/icons-svelte';

    import DownloadButton from './buttons/DownloadButton.svelte';
    import ClearButton from './buttons/ClearButton.svelte';

    let link: string = "";
    let isFocused = false;

    const validLink = (link: string) => {
        try {
            return /^https:/i.test(new URL(link).protocol);
        } catch {
            return false
        }
    }
</script>

<div id="omnibox">
    <div id="input-container" class:focused={isFocused} class:downloadable={validLink(link)}>
        <IconLink id="input-link-icon" color="var(--gray)" size="18px" />

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
        >

        {#if link.length > 0}
            <ClearButton click={() => link = ""} />
        {/if}
        {#if validLink(link)}
            <DownloadButton />
        {/if}
    </div>
</div>

<style>
    #omnibox {
        display: flex;
        flex-direction: column;
        max-width: 640px;
        width: 100%;
        gap: var(--padding);
    }

    #input-container {
        display: flex;
        box-shadow: 0 0 0 1.5px var(--gray) inset;
        border-radius: 11px;
        padding: 0 12px;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        flex: 1
    }

    #input-container.downloadable {
        padding-right: 0;
    }

    #input-container.focused {
        box-shadow: 0 0 0 1.5px var(--secondary) inset;
        outline: var(--secondary) 0.5px solid;
    }

    #input-container.focused :global(#input-link-icon) {
        stroke: var(--secondary);
    }
    #input-container.downloadable :global(#input-link-icon) {
        stroke: var(--secondary);
    }

    #link-area {
        display: flex;
        width: 100%;
        margin: 0;
        padding: 12px 0;
        height: 18px;

        align-items: center;

        border: none;
        outline: none;
        background-color: transparent;
        color: var(--secondary);

        -webkit-tap-highlight-color: transparent;
        flex: 1;

        font-weight: 500;

        /* workaround for safari */
        font-size: inherit;
    }

    #link-area::placeholder {
        color: var(--gray)
    }
</style>
