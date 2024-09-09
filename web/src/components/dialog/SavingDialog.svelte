<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { device } from "$lib/device";
    import {
        copyURL,
        openURL,
        shareURL,
        openFile,
        shareFile,
    } from "$lib/download";

    import DialogContainer from "$components/dialog/DialogContainer.svelte";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import DialogButtons from "$components/dialog/DialogButtons.svelte";
    import SavingTutorial from "$components/dialog/SavingTutorial.svelte";
    import VerticalActionButton from "$components/buttons/VerticalActionButton.svelte";

    import IconShare2 from "@tabler/icons-svelte/IconShare2.svelte";
    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";
    import IconFileDownload from "@tabler/icons-svelte/IconFileDownload.svelte";

    import CopyIcon from "$components/misc/CopyIcon.svelte";
    export let id: string;
    export let dismissable = true;
    export let bodyText: string = "";

    export let url: string = "";
    export let file: File | undefined = undefined;

    let close: () => void;

    let copied = false;

    $: if (copied) {
        setTimeout(() => {
            copied = false;
        }, 1500);
    }
</script>

<DialogContainer {id} {dismissable} bind:close>
    <div class="dialog-body popup-body">
        <div class="meowbalt-container">
            <Meowbalt emotion="question" />
        </div>

        <div class="dialog-inner-container">
            <div class="popup-header">
                <IconFileDownload />
                <h2 class="popup-title" tabindex="-1">
                    {$t("dialog.saving.title")}
                </h2>
            </div>

            <div class="action-buttons">
                {#if device.supports.directDownload}
                    <VerticalActionButton
                        id="save-download"
                        fill
                        elevated
                        click={() => {
                            if (file) {
                                return openFile(file);
                            } else if (url) {
                                return openURL(url);
                            }
                        }}
                    >
                        <IconDownload />
                        {$t("button.download")}
                    </VerticalActionButton>
                {/if}

                {#if device.supports.share}
                    <VerticalActionButton
                        id="save-share"
                        fill
                        elevated
                        click={async () => {
                            if (file) {
                                return await shareFile(file);
                            } else if (url) {
                                return await shareURL(url);
                            }
                        }}
                    >
                        <IconShare2 />
                        {$t("button.share")}
                    </VerticalActionButton>
                {/if}

                {#if !file}
                    <VerticalActionButton
                        id="save-copy"
                        fill
                        elevated
                        click={async () => {
                            copyURL(url);
                            copied = true;
                        }}
                        ariaLabel={copied ? $t("button.copied") : ""}
                    >
                        <CopyIcon check={copied} />
                        {$t("button.copy")}
                    </VerticalActionButton>
                {/if}
            </div>

            {#if device.is.iOS}
                <SavingTutorial />
            {/if}

            {#if bodyText}
                <div class="body-text">
                    {bodyText}
                </div>
            {/if}
        </div>

        <DialogButtons
            buttons={[
                {
                    text: $t("button.done"),
                    main: true,
                    action: () => {},
                },
            ]}
            closeFunc={close}
        />
    </div>
</DialogContainer>

<style>
    .popup-body,
    .dialog-inner-container {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    .dialog-inner-container {
        overflow-y: scroll;
        gap: 8px;
        width: 100%;
    }

    .popup-body {
        max-width: 340px;
        width: calc(100% - var(--padding) - var(--dialog-padding) * 2);
        max-height: 70%;
        margin: calc(var(--padding) / 2);
    }

    .meowbalt-container {
        position: absolute;
        top: -126px;
        right: 0;
        /* simulate meowbalt being behind the popup */
        clip-path: inset(0px 0px 14px 0px);
    }

    .popup-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: calc(var(--padding) / 2);
        color: var(--secondary);
    }

    .popup-header :global(svg) {
        height: 21px;
        width: 21px;
    }

    .popup-title {
        color: var(--secondary);
        font-size: 19px;
    }

    .popup-title:focus-visible {
        box-shadow: none !important;
    }

    .action-buttons {
        display: flex;
        flex-direction: row;
        gap: calc(var(--padding) / 2);
        position: relative;
    }

    .body-text {
        font-size: 13px;
        font-weight: 500;
        line-height: 1.5;
        color: var(--gray);
        white-space: pre-wrap;
        user-select: text;
        -webkit-user-select: text;
    }
</style>
