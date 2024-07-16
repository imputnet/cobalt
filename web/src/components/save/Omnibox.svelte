<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { SvelteComponent, tick } from "svelte";

    import { t } from "$lib/i18n/translations";

    import dialogs from "$lib/dialogs";

    import { updateSetting } from "$lib/state/settings";
    import type { DownloadModeOption } from "$lib/types/settings";

    import IconLink from "@tabler/icons-svelte/IconLink.svelte";

    import ClearButton from "$components/save/buttons/ClearButton.svelte";
    import DownloadButton from "$components/save/buttons/DownloadButton.svelte";

    import Switcher from "$components/buttons/Switcher.svelte";
    import ActionButton from "$components/buttons/ActionButton.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";

    import IconMute from "$lib/icons/Mute.svelte";
    import IconMusic from "$lib/icons/Music.svelte";
    import IconSparkles from "$lib/icons/Sparkles.svelte";
    import IconClipboard from "$lib/icons/Clipboard.svelte";

    let link: string = "";
    let linkInput: HTMLInputElement | undefined;
    let isFocused = false;

    let isDisabled: boolean = false;

    let downloadButton: SvelteComponent;

    const validLink = (link: string) => {
        try {
            return /^https:/i.test(new URL(link).protocol);
        } catch {}
    };

    $: linkFromHash = $page.url.hash.replace("#", "") || "";
    $: linkFromQuery = $page.url.searchParams.get("u") || "";

    $: if (linkFromHash || linkFromQuery) {
        if (validLink(linkFromHash)) {
            link = linkFromHash;
        } else if (validLink(linkFromQuery)) {
            link = linkFromQuery;
        }

        // clear hash and query to prevent bookmarking unwanted links
        goto("/", { replaceState: true });
    }

    const pasteClipboard = () => {
        if (isDisabled || $dialogs.length > 0) {
            return;
        }

        navigator.clipboard.readText().then(async (text) => {
            let matchLink = text.match(/https:\/\/[^\s]+/g);
            if (matchLink) {
                link = matchLink[0];

                await tick(); // wait for button to render
                downloadButton.download(link);
            }
        });
    };

    const changeDownloadMode = (mode: DownloadModeOption) => {
        updateSetting({ save: { downloadMode: mode } });
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (!linkInput || $dialogs.length > 0 || isDisabled) {
            return;
        }

        if (e.metaKey || e.ctrlKey || e.key === "/") {
            linkInput.focus();
        }

        if (e.key === "Enter" && validLink(link)) {
            downloadButton.download(link);
        }

        if (["Escape", "Clear"].includes(e.key)) {
            link = "";
        }

        if (e.target === linkInput) {
            return;
        }

        switch (e.key) {
            case "D":
                pasteClipboard();
                break;
            case "J":
                changeDownloadMode("auto");
                break;
            case "K":
                changeDownloadMode("audio");
                break;
            case "L":
                changeDownloadMode("mute");
                break;
            default:
                break;
        }
    };
</script>

<svelte:window on:keydown={handleKeydown} />

<div id="omnibox">
    <div
        id="input-container"
        class:focused={isFocused}
        class:downloadable={validLink(link)}
    >
        <IconLink id="input-link-icon" />

        <input
            id="link-area"
            bind:value={link}
            bind:this={linkInput}
            on:input={() => (isFocused = true)}
            on:focus={() => (isFocused = true)}
            on:blur={() => (isFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="256"
            placeholder={$t("save.input.placeholder")}
            aria-label={$t("a11y.save.linkArea")}
            data-form-type="other"
        />

        {#if link}
            <ClearButton click={() => (link = "")} />
        {/if}
        {#if validLink(link)}
            <DownloadButton url={link} bind:this={downloadButton} bind:isDisabled={isDisabled} />
        {/if}
    </div>

    <div id="action-container">
        <Switcher>
            <SettingsButton
                settingContext="save"
                settingId="downloadMode"
                settingValue="auto"
            >
                <IconSparkles />
                {$t("save.auto")}
            </SettingsButton>
            <SettingsButton
                settingContext="save"
                settingId="downloadMode"
                settingValue="audio"
            >
                <IconMusic />
                {$t("save.audio")}
            </SettingsButton>
            <SettingsButton
                settingContext="save"
                settingId="downloadMode"
                settingValue="mute"
            >
                <IconMute />
                {$t("save.mute")}
            </SettingsButton>
        </Switcher>

        <ActionButton id="paste" click={pasteClipboard}>
            <IconClipboard />
            <span id="paste-desktop-text">{$t("save.paste")}</span>
            <span id="paste-mobile-text">{$t("save.paste.long")}</span>
        </ActionButton>
    </div>
</div>

<style>
    #omnibox {
        display: flex;
        flex-direction: column;
        max-width: 640px;
        width: 100%;
        gap: 10px;
    }

    #input-container {
        display: flex;
        box-shadow: 0 0 0 1.5px var(--input-border) inset;
        border-radius: var(--border-radius);
        padding: 0 10px;
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

    :global(#input-link-icon) {
        stroke: var(--gray);
        width: 18px;
        height: 18px;
        stroke-width: 2px;
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
        padding: 10px 0;
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

    #link-area:focus-visible {
        box-shadow: unset !important;
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

    #paste-mobile-text {
        display: none;
    }

    @media screen and (max-width: 440px) {
        #action-container {
            flex-direction: column;
            gap: 5px;
        }

        #action-container :global(.button) {
            width: 100%;
        }

        #paste-mobile-text {
            display: block;
        }

        #paste-desktop-text {
            display: none;
        }
    }
</style>
