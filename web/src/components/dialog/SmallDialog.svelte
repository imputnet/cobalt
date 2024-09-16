<script lang="ts">
    import type { Optional } from "$lib/types/generic";
    import type { MeowbaltEmotions } from "$lib/types/meowbalt";
    import type { DialogButton, SmallDialogIcons } from "$lib/types/dialog";

    import DialogContainer from "$components/dialog/DialogContainer.svelte";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import DialogButtons from "$components/dialog/DialogButtons.svelte";

    import IconAlertTriangle from "@tabler/icons-svelte/IconAlertTriangle.svelte";

    export let id: string;
    export let meowbalt: Optional<MeowbaltEmotions> = undefined;
    export let icon: Optional<SmallDialogIcons> = undefined;
    export let title = "";
    export let bodyText = "";
    export let bodySubText = "";
    export let buttons: Optional<DialogButton[]> = undefined;
    export let dismissable = true;
    export let leftAligned = false;

    let close: () => void;
</script>

<DialogContainer {id} {dismissable} bind:close>
    <div
        class="dialog-body small-dialog"
        class:meowbalt-visible={meowbalt}
        class:align-left={leftAligned}
    >
        {#if meowbalt}
            <div class="meowbalt-container">
                <Meowbalt emotion={meowbalt} />
            </div>
        {/if}
        <div class="dialog-inner-container">
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
                <div class="subtext popup-subtext">{bodySubText}</div>
            {/if}
        </div>
        {#if buttons}
            <DialogButtons {buttons} closeFunc={close} />
        {/if}
    </div>
</DialogContainer>

<style>
    .small-dialog,
    .dialog-inner-container {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    .dialog-inner-container {
        overflow-y: scroll;
        gap: 8px;
    }

    .small-dialog {
        text-align: center;
        max-width: 340px;
        width: calc(100% - var(--padding) - var(--dialog-padding) * 2);
        max-height: 85%;
        margin: calc(var(--padding) / 2);
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

    .popup-header,
    .popup-icon {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .popup-icon :global(svg) {
        stroke-width: 1.5px;
        height: 50px;
        width: 50px;
    }

    .warn-red :global(svg) {
        stroke: var(--red);
    }

    .body-text {
        font-size: 14.5px;
        font-weight: 500;
        line-height: 1.7;
        color: var(--gray);
        white-space: pre-wrap;
        user-select: text;
        -webkit-user-select: text;
    }

    .body-text:focus-visible,
    .popup-title:focus-visible {
        box-shadow: none !important;
    }

    .popup-subtext {
        opacity: 0.7;
        padding: 0;
    }

    .align-left .body-text {
        text-align: left;
    }

    .align-left .popup-header {
        align-items: start;
        gap: 2px;
    }

    .align-left .popup-icon :global(svg) {
        height: 40px;
        width: 40px;
        stroke-width: 1.8px;
    }
</style>
