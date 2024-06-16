<script lang="ts">
    import { IconLink } from "@tabler/icons-svelte";

    import DownloadButton from "./buttons/DownloadButton.svelte";
    import ClearButton from "./buttons/ClearButton.svelte";
    import ActionButton from "../buttons/ActionButton.svelte";

    import Switcher from "../buttons/Switcher.svelte";

    import IconSparkles from "$lib/icons/Sparkles.svelte";
    import IconMusic from "$lib/icons/Music.svelte";
    import IconMute from "$lib/icons/Mute.svelte";

    import IconClipboard from "$lib/icons/Clipboard.svelte";

    let link: string = "";
    let isFocused = false;

    const validLink = (link: string) => {
        try {
            return /^https:/i.test(new URL(link).protocol);
        } catch {
            return false;
        }
    };

    const pasteClipboard = () => {
        navigator.clipboard.readText().then((text) => {
            let matchLink = text.match(/https:\/\/[^\s]+/g);
            if (matchLink) {
                link = matchLink[0];
            }
        });
    };
</script>

<div id="omnibox">
    <div
        id="input-container"
        class:focused={isFocused}
        class:downloadable={validLink(link)}
    >
        <IconLink id="input-link-icon" color="var(--gray)" size="18px" />

        <input
            id="link-area"
            bind:value={link}
            on:input={() => (isFocused = true)}
            on:focus={() => (isFocused = true)}
            on:blur={() => (isFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="256"
            placeholder="paste the link here"
            aria-label="link input area"
            data-form-type="other"
        />

        {#if link.length > 0}
            <ClearButton click={() => (link = "")} />
        {/if}
        {#if validLink(link)}
            <DownloadButton url={link} />
        {/if}
    </div>

    <div id="action-container">
        <Switcher settingId="save-downloadMode">
            <ActionButton id="auto-mode-button" text="auto">
                <IconSparkles />
            </ActionButton>
            <ActionButton id="audio-mode-button" text="audio">
                <IconMusic />
            </ActionButton>
            <ActionButton id="mute-mode-button" text="mute">
                <IconMute />
            </ActionButton>
        </Switcher>
        <ActionButton id="paste-button" click={pasteClipboard} text="paste">
            <IconClipboard />
        </ActionButton>
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
        box-shadow: 0 0 0 1.5px var(--input-border) inset;
        border-radius: var(--border-radius);
        padding: 0 12px;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        flex: 1;
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
        color: var(--gray);
    }

    #action-container {
        display: flex;
        flex-direction: row;
    }

    #action-container {
        justify-content: space-between;
    }
</style>
