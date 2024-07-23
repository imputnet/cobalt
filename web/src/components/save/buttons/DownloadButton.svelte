<script lang="ts">
    import "@fontsource-variable/noto-sans-mono";

    import API from "$lib/api";
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/dialogs";
    import { downloadFile } from "$lib/download";

    import type { DialogInfo } from "$lib/types/dialog";

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
                text: $t("dialog.button.gotit"),
                main: true,
                action: () => {},
            },
        ],
    };

    type DownloadButtonState = "idle" | "think" | "check" | "done" | "error";

    const changeDownloadButton = (state: DownloadButtonState) => {
        disabled = state !== 'idle';

        buttonText = ({
             idle: ">>",
            think: "...",
            check: "..?",
             done: ">>>",
            error: "!!"
        })[state];

        buttonAltText = $t(
            ({
                 idle: "a11y.save.download",
                think: "a11y.save.downloadThink",
                check: "a11y.save.downloadCheck",
                 done: "a11y.save.downloadDone",
                error: "a11y.save.downloadError",
            })[state]
        );

        // states that don't wait for anything, and thus can
        // transition back to idle after some period of time.
        const final: DownloadButtonState[] = ['done', 'error'];
        if (final.includes(state)) {
            setTimeout(() => changeDownloadButton("idle"), 2500);
        }
    };

    export const download = async (link: string) => {
        changeDownloadButton("think");

        const response = await API.request(link);

        if (!response) {
            changeDownloadButton("error");

            return createDialog({
                ...defaultErrorPopup,
                bodyText: "couldn't access the api",
            });
        }

        if (response.status === "error" || response.status === "rate-limit") {
            changeDownloadButton("error");

            return createDialog({
                ...defaultErrorPopup,
                bodyText: response.text,
            });
        }

        if (response.status === "redirect") {
            changeDownloadButton("done");

            return downloadFile(response.url);
        }

        if (response.status === "stream") {
            changeDownloadButton("check");

            const probeResult = await API.probeCobaltStream(response.url);

            if (probeResult === 200) {
                changeDownloadButton("done");

                return downloadFile(response.url);
            } else {
                changeDownloadButton("error");

                return createDialog({
                    ...defaultErrorPopup,
                    bodyText: "couldn't probe the stream",
                });
            }
        }

        if (response.status === "picker") {
            changeDownloadButton("done");
            const buttons = [
                {
                    text: $t("dialog.button.done"),
                    main: true,
                    action: () => {},
                },
            ];

            if (response.audio) {
                const pickerAudio = response.audio;
                buttons.unshift({
                    text: $t("dialog.button.downloadAudio"),
                    main: false,
                    action: () => {
                        downloadFile(pickerAudio);
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
            bodyText: "unknown/unsupported status",
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
        letter-spacing: -0.22em;

        margin-bottom: 0.1rem;
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
