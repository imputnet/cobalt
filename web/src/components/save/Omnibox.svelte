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
    import type { CobaltSaveRequestBody } from "$lib/types/api";

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

    import API from "$lib/api/api";
    import ClipRangeSlider from "./ClipRangeSlider.svelte";
    import ClipCheckbox from "./buttons/ClipCheckbox.svelte";

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

    let clipMode = $state(false);
    let metadata: { title?: string; author?: string; duration?: number } | null = $state(null);
    let metaLoading = $state(false);
    let metaError: string | null = $state(null);
    let clipStart = $state(0);
    let clipEnd = $state(0);

    async function fetchMetadata() {
        if (!validLink($link)) return;
        metaLoading = true;
        metaError = null;
        metadata = null;
        try {
            const res = await API.getMetadata($link);
            if (res.status === "success") {
                metadata = res.metadata;
                clipStart = 0;
                clipEnd = metadata?.duration || 0;
            } else {
                metaError = res.message || "Failed to fetch metadata.";
            }
        } catch (e: any) {
            metaError = e.message || "Failed to fetch metadata.";
        } finally {
            metaLoading = false;
        }
    }

    $effect(() => {
        if (clipMode && validLink($link)) {
            fetchMetadata();
        }
    });

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

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3).padStart(6, '0');
        return `${m}:${s}`;
    }
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
            clipMode={clipMode}
            clipStart={clipStart}
            clipEnd={clipEnd}
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


        <ClipCheckbox checked={clipMode} onclick={() => clipMode = !clipMode} />

        <ActionButton id="paste" click={pasteClipboard}>
            <IconClipboard />
            <span id="paste-desktop-text">{$t("save.paste")}</span>
            <span id="paste-mobile-text">{$t("save.paste.long")}</span>
        </ActionButton>
    </div>

    {#if clipMode && validLink($link)}
        <div class="clip-controls">
            {#if metaLoading}
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <span>Loading video metadata...</span>
                </div>
            {:else if metaError}
                <div class="error-state">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>{metaError}</span>
                </div>
            {:else if metadata}
                <div class="clip-metadata">
                    <div class="metadata-header">
                        <h4>Clip</h4>
                        <div class="duration-badge">
                            {typeof metadata.duration === 'number' ? formatTime(metadata.duration) : 'Unknown'}
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title" title={metadata.title}>
                            {metadata.title}
                        </div>
                        {#if metadata.author}
                            <div class="video-author">
                                by {metadata.author}
                            </div>
                        {/if}
                    </div>
                </div>
                
                <ClipRangeSlider
                    min={0}
                    max={metadata.duration || 0}
                    step={0.001}
                    bind:start={clipStart}
                    bind:end={clipEnd}
                />
                
                <div class="clip-time-display">
                    <div class="time-indicators">
                        <span class="start-time">{formatTime(clipStart)}</span>
                        <span class="duration-selected">
                            {formatTime(Math.max(0, clipEnd - clipStart))} selected
                        </span>
                        <span class="end-time">{formatTime(clipEnd)}</span>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
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

    .clip-controls {
        margin-top: 12px;
        padding: 16px;
        background: var(--button);
        border-radius: var(--border-radius);
        border: 1px solid var(--button-stroke);
        animation: slideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
    }

    .loading-state {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        color: var(--gray);
        font-size: 14px;
    }

    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--button-hover);
        border-top: 2px solid var(--secondary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-state {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: rgba(237, 34, 54, 0.1);
        border: 1px solid rgba(237, 34, 54, 0.2);
        border-radius: 8px;
        color: var(--red);
        font-size: 13px;
        font-weight: 500;
    }

    .clip-metadata {
        margin-bottom: 16px;
    }

    .metadata-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
    }

    .metadata-header h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--secondary);
    }

    .duration-badge {
        background: var(--button-elevated);
        color: var(--button-text);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        font-family: 'IBM Plex Mono', monospace;
    }

    .video-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .video-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
    }

    .video-author {
        font-size: 12px;
        color: var(--gray);
        font-weight: 400;
    }

    .clip-time-display {
        margin-top: 8px;
    }

    .time-indicators {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 500;
        font-family: 'IBM Plex Mono', monospace;
    }

    .start-time, .end-time {
        color: var(--gray);
        background: var(--button-hover);
        padding: 2px 6px;
        border-radius: 4px;
        min-width: 50px;
        text-align: center;
    }

    .duration-selected {
        grid-area: duration;
        text-align: center;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

        .clip-controls {
            padding: 12px;
        }

        .metadata-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .video-title {
            white-space: normal;
        }

        .time-indicators {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                "start end"
                "duration duration";
            gap: 8px;
        }

        .start-time {
            grid-area: start;
        }

        .end-time {
            grid-area: end;
        }
    }
</style>
