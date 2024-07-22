<script lang="ts">
    import { tick } from "svelte";
    import { killDialog } from "$lib/dialogs";

    import type { Optional } from "$lib/types/generic";
    import type { MeowbaltEmotions } from "$lib/types/meowbalt";
    import type { DialogButton, SmallDialogIcons } from "$lib/types/dialog";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import DialogButtons from "$components/dialog/DialogButtons.svelte";
    import DialogBackdropClose from "$components/dialog/DialogBackdropClose.svelte";

    import IconAlertTriangle from "@tabler/icons-svelte/IconAlertTriangle.svelte";

    export let id: string;
    export let meowbalt: Optional<MeowbaltEmotions> = undefined;
    export let icon: Optional<SmallDialogIcons> = undefined;
    export let title = "";
    export let bodyText = "";
    export let bodySubText = "";
    export let buttons: Optional<DialogButton[]> = undefined;

    let dialogParent: HTMLDialogElement;

    let closing = false;
    let open = false;

    const close = () => {
        if (dialogParent) {
            closing = true;
            open = false;
            setTimeout(() => {
                dialogParent.close();
                killDialog();
            }, 150);
        }
    };

    $: if (dialogParent) {
        dialogParent.showModal();
        tick().then(() => {
            open = true;
        });
    }
</script>

<dialog id="dialog-{id}" bind:this={dialogParent} class:closing class:open>
    <div class="dialog-body small-dialog" class:meowbalt-visible={meowbalt}>
        {#if meowbalt}
            <div class="meowbalt-container">
                <Meowbalt emotion={meowbalt} />
            </div>
        {/if}
        <div class="popup-body">
            {#if title || icon}
                <div class="popup-header">
                    {#if icon === "warn-red"}
                        <div class="popup-icon {icon}">
                            <IconAlertTriangle />
                        </div>
                    {/if}
                    {#if title}
                        <h2 class="popup-title" tabindex="-1">{title}</h2>
                    {/if}
                </div>
            {/if}
            {#if bodyText}
                <div class="body-text" tabindex="-1">{bodyText}</div>
            {/if}
            {#if bodySubText}
                <div class="subtext">{bodySubText}</div>
            {/if}
        </div>
        {#if buttons}
            <DialogButtons {buttons} closeFunc={close} />
        {/if}
    </div>

    <DialogBackdropClose closeFunc={close} />
</dialog>

<style>
    .small-dialog,
    .popup-body {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    .popup-body {
        gap: 8px;
    }

    .small-dialog {
        --dialog-padding: 18px;

        align-items: center;
        text-align: center;
        max-width: 340px;
        width: calc(
            100% - var(--padding) * 2 - var(--dialog-padding) * 2
        );
        background: var(--popup-bg);
        box-shadow:
            0 0 0 2px var(--popup-stroke) inset,
            0 0 60px 10px var(--popup-bg);
        padding: var(--dialog-padding);
        margin: var(--padding);
        border-radius: 29px;
        position: relative;
        will-change: transform;
    }

    .small-dialog.meowbalt-visible {
        padding-top: calc(var(--padding) * 4);
    }

    .meowbalt-container {
        position: absolute;
        top: -120px;
    }

    .popup-title {
        color: var(--secondary);
        font-size: 19px;
    }

    .popup-header .popup-icon.warn-red :global(svg) {
        stroke-width: 1.5px;
        height: 50px;
        width: 50px;
        stroke: var(--red);
    }

    .body-text {
        font-size: 14.5px;
        font-weight: 500;
        line-height: 1.7;
        color: var(--gray);
        user-select: text;
        -webkit-user-select: text;
    }

    .body-text:focus-visible,
    .popup-title:focus-visible {
        box-shadow: none !important;
    }

    @media screen and (max-width: 535px) {
        .small-dialog {
            margin-bottom: calc(var(--padding) + env(safe-area-inset-bottom));
            box-shadow: 0 0 0 2px var(--popup-stroke) inset;
        }
    }
</style>
