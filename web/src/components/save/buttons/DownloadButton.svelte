<script lang="ts">
    import { onDestroy } from "svelte";
    import { t } from "$lib/i18n/translations";
    import { hapticSwitch } from "$lib/haptics";
    import { savingHandler } from "$lib/api/saving-handler";
    import { downloadButtonState } from "$lib/state/omnibox";

    import type { CobaltDownloadButtonState } from "$lib/types/omnibox";

    export let url: string;
    export let disabled = false;
    export let loading = false;

    $: buttonText = ">>";
    $: buttonAltText = $t("a11y.save.download");

    type DownloadButtonState = "idle" | "think" | "check" | "done" | "error";

    const unsubscribe = downloadButtonState.subscribe(
        (state: CobaltDownloadButtonState) => {
            disabled = state !== "idle";
            loading = state === "think" || state === "check";

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
                setTimeout(() => downloadButtonState.set("idle"), 1500);
            }
        }
    );

    onDestroy(() => unsubscribe());
</script>

<button
    id="download-button"
    {disabled}
    on:click={() => {
        hapticSwitch();
        savingHandler({ url });
    }}
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
        width: 48px;

        border-radius: 0;

        /* visually align the button, +1.5px because of inset box-shadow on parent */
        padding: 0 13.5px 0 12px;

        background: none;
        box-shadow: none;
        transform: none;

        border-left: 1.5px var(--input-border) solid;
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
    }

    #download-button:dir(rtl) {
        border-left: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;

        border-right: 1.5px var(--input-border) solid;
        border-top-left-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);

        direction: ltr;
        padding: 0 12px 0 15px;
    }

    #download-state {
        font-size: 24px;
        font-family: "Noto Sans Mono", "IBM Plex Mono", monospace;
        font-weight: 400;

        text-align: center;
        text-indent: -5px;
        letter-spacing: -5.3px;

        margin-bottom: 2px;
    }

    #download-button:disabled {
        cursor: unset;
        color: var(--gray);
    }

    :global(#input-container.focused) #download-button {
        border-left: 2px var(--secondary) solid;
    }

    :global(#input-container.focused) #download-button:dir(rtl) {
        border-left: 0;
        border-right: 2px var(--secondary) solid;
    }

    @media (hover: hover) {
        #download-button:hover:not(:disabled) {
            background: var(--button-hover-transparent);
        }
    }

    #download-button:active:not(:disabled) {
        background: var(--button-press-transparent);
    }
</style>
