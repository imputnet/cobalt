<script lang="ts">
    import env, { officialApiURL } from "$lib/env";

    import { tick } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    import { t } from "$lib/i18n/translations";

    import dialogs from "$lib/state/dialogs";
    import { link } from "$lib/state/omnibox";
    import { hapticSwitch } from "$lib/haptics";
    import { updateSetting } from "$lib/state/settings";
    import { savingHandler } from "$lib/api/saving-handler";
    import { pasteLinkFromClipboard } from "$lib/clipboard";
    import { turnstileEnabled, turnstileSolved } from "$lib/state/turnstile";

    import type { Optional } from "$lib/types/generic";
    import type { DownloadModeOption } from "$lib/types/settings";

    import ClearButton from "$components/save/buttons/ClearButton.svelte";
    import DownloadButton from "$components/save/buttons/DownloadButton.svelte";

    import Switcher from "$components/buttons/Switcher.svelte";
    import OmniboxIcon from "$components/save/OmniboxIcon.svelte";
    import ActionButton from "$components/buttons/ActionButton.svelte";
    import CaptchaTooltip from "$components/save/CaptchaTooltip.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";

    import IconMute from "$components/icons/Mute.svelte";
    import IconMusic from "$components/icons/Music.svelte";
    import IconSparkles from "$components/icons/Sparkles.svelte";
    import IconClipboard from "$components/icons/Clipboard.svelte";

    let linkInput: Optional<HTMLInputElement>;

    const validLink = (url: string) => {
        try {
            return /^https?\:/i.test(new URL(url).protocol);
        } catch {}
    };

    let isFocused = $state(false);
    let isDisabled = $state(false);
    let isLoading = $state(false);

    let isHovered = $state(false);

    let isBotCheckOngoing = $derived($turnstileEnabled && !$turnstileSolved);

    let linkPrefill = $derived(
        page.url.hash.replace("#", "")
        || (browser ? page.url.searchParams.get("u") : "")
        || ""
    );

    let downloadable = $derived(validLink($link));
    let clearVisible = $derived($link && !isLoading);

    $effect (() => {
        if (linkPrefill) {
            // prefilled link may be uri encoded
            linkPrefill = decodeURIComponent(linkPrefill);

            if (validLink(linkPrefill)) {
                $link = linkPrefill;
            }

            // clear hash and query to prevent bookmarking unwanted links
            if (browser) goto("/", { replaceState: true });

            // clear link prefill to avoid extra effects
            linkPrefill = "";

            savingHandler({ url: $link });
        }
    });

    const pasteClipboard = async () => {
        if ($dialogs.length > 0 || isDisabled || isLoading) {
            return;
        }

        hapticSwitch();

        const pastedData = await pasteLinkFromClipboard();
        if (!pastedData) return;

        const linkMatch = pastedData.match(/https?\:\/\/[^\s]+/g);

        if (linkMatch) {
            $link = linkMatch[0].split('，')[0];

            await tick(); // wait for button to render
            savingHandler({ url: $link });
        }
    };

    const changeDownloadMode = (mode: DownloadModeOption) => {
        updateSetting({ save: { downloadMode: mode } });
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (!linkInput || $dialogs.length > 0 || isDisabled || isLoading) {
            return;
        }

        if (e.metaKey || e.ctrlKey || e.key === "/") {
            linkInput.focus();
        }

        if (e.key === "Enter" && validLink($link) && isFocused) {
            savingHandler({ url: $link });
        }

        if (["Escape", "Clear"].includes(e.key) && isFocused) {
            $link = "";
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

<svelte:window onkeydown={handleKeydown} />

<!--
    if you want to remove the community instance label,
    refer to the license first https://github.com/imputnet/cobalt/tree/main/web#license
-->
{#if env.DEFAULT_API !== officialApiURL}
    <div id="instance-label">
        {$t("save.label.community_instance")}
    </div>
{/if}

<div id="omnibox">
    {#if $turnstileEnabled}
        <CaptchaTooltip
            visible={isBotCheckOngoing && (isHovered || isFocused)}
        />
    {/if}

    <div
        id="input-container"
        class:focused={isFocused}
        class:downloadable
        class:clear-visible={clearVisible}
    >
        <OmniboxIcon loading={isLoading || isBotCheckOngoing} />

        <input
            id="link-area"
            bind:value={$link}
            bind:this={linkInput}
            oninput={() => (isFocused = true)}
            onfocus={() => (isFocused = true)}
            onblur={() => (isFocused = false)}
            onmouseover={() => (isHovered = true)}
            onmouseleave={() => (isHovered = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="512"
            placeholder={$t("save.input.placeholder")}
            aria-label={isBotCheckOngoing
                ? $t("a11y.save.link_area.turnstile")
                : $t("a11y.save.link_area")}
            data-form-type="other"
            disabled={isDisabled}
        />

        <ClearButton click={() => ($link = "")} />
        <DownloadButton
            url={$link}
            bind:disabled={isDisabled}
            bind:loading={isLoading}
        />
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
        gap: 6px;
        position: relative;
    }

    #input-container {
        --input-padding: 10px;
        display: flex;
        box-shadow: 0 0 0 1.5px var(--input-border) inset;
        /* webkit can't render the 1.5px box shadow properly,
           so we duplicate the border as outline to fix it visually */
        outline: 1.5px solid var(--input-border);
        outline-offset: -1.5px;
        border-radius: var(--border-radius);
        align-items: center;
        gap: var(--input-padding);
        font-size: 14px;
        flex: 1;
    }

    #input-container:not(.clear-visible) :global(#clear-button) {
        display: none;
    }

    #input-container:not(.downloadable) :global(#download-button) {
        display: none;
    }

    #input-container.clear-visible {
        padding-right: var(--input-padding);
    }

    :global([dir="rtl"]) #input-container.clear-visible {
        padding-right: unset;
        padding-left: var(--input-padding);
    }

    #input-container.downloadable {
        padding-right: 0;
    }

    #input-container.downloadable:dir(rtl) {
        padding-left: 0;
    }

    #input-container.focused {
        box-shadow: none;
        outline: var(--secondary) 2px solid;
        outline-offset: -1px;
    }

    #input-container.focused :global(#input-icons svg) {
        stroke: var(--secondary);
    }

    #input-container.downloadable :global(#input-icons svg) {
        stroke: var(--secondary);
    }

    #link-area {
        display: flex;
        width: 100%;
        margin: 0;
        padding: var(--input-padding) 0;
        padding-left: calc(var(--input-padding) + 28px);
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

        /* prevents input from poking outside of rounded corners */
        border-radius: var(--border-radius);
    }

    :global([dir="rtl"]) #link-area {
        padding-left: unset;
        padding-right: calc(var(--input-padding) + 28px);
    }

    #link-area::placeholder {
        color: var(--gray);
        /* fix for firefox */
        opacity: 1;
    }

    /* fix for safari */
    input:disabled {
        opacity: 1;
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

    #instance-label {
        font-size: 13px;
        color: var(--gray);
        font-weight: 500;
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
