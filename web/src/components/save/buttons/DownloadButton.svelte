<script lang="ts">
    import "@fontsource-variable/noto-sans-mono";
    import { onMount } from "svelte";

    import settings from "$lib/state/settings";
    import API from "$lib/api/api";
    import APIUrl from "$lib/state/api-url";
    import lazySettingGetter from "$lib/settings/lazy-get";
    import { apiOverrideWarning } from "$lib/api/safety-warning";

    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/dialogs";
    import type { DialogInfo } from "$lib/types/dialog";
    import { downloadFile } from "$lib/download";
    import {
        UnauthenticatedCobaltAPI,
        TurnstileCobaltAPI,
        type CobaltAPIClient
    } from "@imput/cobalt-client";

    export let url: string;
    export let disabled = false;

    $: buttonText = ">>";
    $: buttonAltText = $t("a11y.save.download");

    let defaultErrorPopup: DialogInfo = {
        id: "save-error",
        type: "small",
        meowbalt: "error",
        buttons: [
            {
                text: $t("button.gotit"),
                main: true,
                action: () => {},
            },
        ],
    };

    type DownloadButtonState = "idle" | "think" | "check" | "done" | "error";

    const changeDownloadButton = (state: DownloadButtonState) => {
        disabled = state !== "idle";

        buttonText = {
            idle: ">>",
            think: "...",
            check: "..?",
            done: ">>>",
            error: "!!",
        }[state];

        buttonAltText = $t(
            {
                idle: "a11y.save.download",
                think: "a11y.save.download.think",
                check: "a11y.save.download.check",
                done: "a11y.save.download.done",
                error: "a11y.save.download.error",
            }[state]
        );

        // states that don't wait for anything, and thus can
        // transition back to idle after some period of time.
        const final: DownloadButtonState[] = ["done", "error"];
        if (final.includes(state)) {
            setTimeout(() => changeDownloadButton("idle"), 1500);
        }
    };

    let client: CobaltAPIClient;

    $: client?.setBaseURL($APIUrl);

    onMount(() => {
        if (env.TURNSTILE_KEY) {
            client = new TurnstileCobaltAPI(window.turnstile);
        } else {
            client = new UnauthenticatedCobaltAPI();
        }
        client.setBaseURL($APIUrl);
    });

    export const download = async (link: string) => {
        changeDownloadButton("think");

        const getSetting = lazySettingGetter($settings);

        const request = {
            url: link,

            downloadMode: getSetting("save", "downloadMode"),
            audioBitrate: getSetting("save", "audioBitrate"),
            audioFormat: getSetting("save", "audioFormat"),
            tiktokFullAudio: getSetting("save", "tiktokFullAudio"),
            youtubeDubBrowserLang: getSetting("save", "youtubeDubBrowserLang"),

            youtubeVideoCodec: getSetting("save", "youtubeVideoCodec"),
            videoQuality: getSetting("save", "videoQuality"),

            filenameStyle: getSetting("save", "filenameStyle"),
            disableMetadata: getSetting("save", "disableMetadata"),

            twitterGif: getSetting("save", "twitterGif"),
            tiktokH265: getSetting("save", "tiktokH265"),

            alwaysProxy: getSetting("privacy", "alwaysProxy"),
        }

        await apiOverrideWarning();
        const response = await client.request(request);

        if (!response) {
            changeDownloadButton("error");

            return createDialog({
                ...defaultErrorPopup,
                bodyText: $t("error.api.unreachable"),
            });
        }

        if (response.status === "error") {
            changeDownloadButton("error");

            return createDialog({
                ...defaultErrorPopup,
                bodyText: $t(response.error.code, response?.error?.context),
            });
        }

        if (response.status === "redirect") {
            changeDownloadButton("done");

            return downloadFile({
                url: response.url,
            });
        }

        if (response.status === "tunnel") {
            changeDownloadButton("check");

            const probeResult = await API.probeCobaltTunnel(response.url);

            if (probeResult === 200) {
                changeDownloadButton("done");

                return downloadFile({
                    url: response.url,
                });
            } else {
                changeDownloadButton("error");

                return createDialog({
                    ...defaultErrorPopup,
                    bodyText: $t("error.tunnel.probe"),
                });
            }
        }

        if (response.status === "picker") {
            changeDownloadButton("done");
            const buttons = [
                {
                    text: $t("button.done"),
                    main: true,
                    action: () => {},
                },
            ];

            if (response.audio) {
                const pickerAudio = response.audio;
                buttons.unshift({
                    text: $t("button.download.audio"),
                    main: false,
                    action: () => {
                        downloadFile({
                            url: pickerAudio,
                        });
                    },
                });
            }

            return createDialog({
                id: "download-picker",
                type: "picker",
                items: response.picker,
                buttons,
            });
        }

        changeDownloadButton("error");

        return createDialog({
            ...defaultErrorPopup,
            bodyText: $t("error.api.unknown_response"),
        });
    };
</script>

<button
    id="download-button"
    {disabled}
    on:click={() => download(url)}
    aria-label={buttonAltText}
>
    <span id="download-state">{buttonText}</span>
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
        box-shadow: none;
        transform: none;

        border-left: 1.5px var(--input-border) solid;
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
    }

    #download-button:focus-visible {
        box-shadow: 0 0 0 2px var(--blue) inset;
    }

    #download-state {
        font-size: 24px;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono",
            "IBM Plex Mono", monospace;
        font-weight: 400;

        text-align: center;
        text-indent: -5px;
        letter-spacing: -5.3px;

        margin-bottom: 2px;
    }

    #download-button:disabled {
        cursor: unset;
        opacity: 0.7;
    }

    :global(#input-container.focused) #download-button {
        border-left: 2px var(--secondary) solid;
    }

    @media (hover: hover) {
        #download-button:hover {
            background: var(--button-hover-transparent);
        }
        #download-button:disabled:hover {
            background: none;
        }
    }
</style>
