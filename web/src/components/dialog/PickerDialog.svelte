<script lang="ts">
    import { tick } from "svelte";
    import { device } from "$lib/device";
    import { killDialog } from "$lib/dialogs";
    import { t } from "$lib/i18n/translations";

    import type { Optional } from "$lib/types/generic";
    import type { DialogButton } from "$lib/types/dialog";
    import type { DialogPickerItem } from "$lib/types/dialog";

    import PickerItem from "$components/dialog/PickerItem.svelte";
    import DialogButtons from "$components/dialog/DialogButtons.svelte";
    import DialogBackdropClose from "$components/dialog/DialogBackdropClose.svelte";

    import IconBoxMultiple from "@tabler/icons-svelte/IconBoxMultiple.svelte";

    export let id: string;
    export let items: Optional<DialogPickerItem[]>;
    export let buttons: Optional<DialogButton[]>;

    let dialogDescription = "dialog.picker.description.";

    if (device.is.iOS) {
        dialogDescription += "ios";
    } else if (device.is.mobile) {
        dialogDescription += "mobile";
    } else {
        dialogDescription += "desktop";
    }

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

    // item id for alt text
    let counter = 0;

    const itemNumber = () => {
        counter++
        return counter
    }
</script>

<dialog
    id="dialog-{id}"
    bind:this={dialogParent}
    class:closing
    class:open
    class:three-columns={items && items.length <= 3}
>
    <div class="dialog-body picker-dialog">
        <div class="popup-header">
            <div class="popup-title-container">
                <IconBoxMultiple />
                <h2 class="popup-title" tabindex="-1">
                    {$t("dialog.picker.title")}
                </h2>
            </div>
            <div class="subtext popup-description">
                {$t(dialogDescription)}
            </div>
        </div>
        <div class="picker-body">
            {#if items}
                {#each items as item}
                    <PickerItem {item} number={itemNumber()} />
                {/each}
            {/if}
        </div>
        {#if buttons}
            <DialogButtons {buttons} closeFunc={close} />
        {/if}
    </div>

    <DialogBackdropClose closeFunc={close} />
</dialog>

<style>
    .picker-dialog {
        --dialog-padding: 18px;
        --picker-item-size: 120px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--padding);
        max-height: calc(
            90% - env(safe-area-inset-bottom) - env(safe-area-inset-top)
        );

        width: auto;
        background: var(--popup-bg);
        box-shadow:
            0 0 0 2px var(--popup-stroke) inset,
            0 0 60px 10px var(--popup-bg);
        padding: var(--dialog-padding);
        position: relative;
        will-change: transform;

        border-radius: 29px;
    }

    .popup-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        max-width: calc(var(--picker-item-size) * 4);
    }

    .popup-title-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: calc(var(--padding) / 2);
        color: var(--secondary);
    }

    .popup-title-container :global(svg) {
        height: 21px;
        width: 21px;
    }

    .popup-title {
        font-size: 18px;
        line-height: 1.1;
    }

    .popup-description {
        font-size: 13px;
        padding: 0;
    }

    .popup-title:focus-visible {
        box-shadow: none !important;
    }

    .picker-body {
        overflow-y: scroll;
        display: grid;
        justify-items: center;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }

    .three-columns .picker-body {
        grid-template-columns: 1fr 1fr 1fr;
    }

    .three-columns .popup-header {
        max-width: calc(var(--picker-item-size) * 3);
    }

    :global(.picker-item) {
        width: var(--picker-item-size);
        height: var(--picker-item-size);
    }

    @media screen and (max-width: 535px) {
        .picker-dialog {
            margin-bottom: calc(
                var(--dialog-padding) + env(safe-area-inset-bottom)
            );
            box-shadow: 0 0 0 2px var(--popup-stroke) inset;
        }

        .picker-body {
            grid-template-columns: 1fr 1fr 1fr;
        }

        .popup-header {
            max-width: calc(var(--picker-item-size) * 3);
        }
    }

    @media screen and (max-width: 400px) {
        .picker-dialog {
            --picker-item-size: 115px;
        }
    }

    @media screen and (max-width: 380px) {
        .picker-dialog {
            --picker-item-size: 110px;
        }
    }

    @media screen and (max-width: 365px) {
        .picker-dialog {
            --picker-item-size: 105px;
        }
    }

    @media screen and (max-width: 350px) {
        .picker-dialog {
            --picker-item-size: 100px;
        }
    }

    @media screen and (max-width: 335px) {
        .picker-body,
        .three-columns .picker-body {
            grid-template-columns: 1fr 1fr;
        }

        .popup-header {
            max-width: calc(var(--picker-item-size) * 3);
        }
    }

    @media screen and (max-width: 255px) {
        .picker-dialog {
            --picker-item-size: 120px;
        }

        .picker-body,
        .three-columns .picker-body {
            grid-template-columns: 1fr;
        }
    }
</style>
