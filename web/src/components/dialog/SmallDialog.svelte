<script lang="ts">
    import { tick } from "svelte";

    import { killDialog } from "$lib/dialogs";
    import type { DialogButton, SmallDialogIcons } from "$lib/types/dialog";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import type { MeowbaltEmotions } from "$lib/types/meowbalt";

    import IconAlertTriangle from "@tabler/icons-svelte/IconAlertTriangle.svelte";

    export let id: string;
    export let meowbalt: MeowbaltEmotions | undefined;
    export let icon: SmallDialogIcons | undefined;
    export let title: string = "";
    export let bodyText: string = "";
    export let bodySubText: string = "";
    export let buttons: DialogButton[];

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
                        <h2>{title}</h2>
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
        <div class="popup-buttons">
            {#each buttons as button}
                <button
                    class="button popup-button {button.color}"
                    class:active={button.main}
                    on:click={async () => {
                        await button.action();
                        close();
                    }}
                >
                    {button.text}
                </button>
            {/each}
        </div>
    </div>

    <div id="dialog-backdrop" aria-hidden="true" on:click={() => close()}></div>
</dialog>

<style>
    dialog {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: none;

        max-height: 100%;
        max-width: 100%;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        pointer-events: all;

        inset-inline-start: unset;
        inset-inline-end: unset;

        overflow: hidden;
    }

    dialog:modal {
        inset-block-start: 0;
        inset-block-end: 0;
    }

    dialog:modal::backdrop {
        display: none;
    }

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
        --small-dialog-padding: 18px;

        align-items: center;
        text-align: center;
        max-width: 340px;
        width: calc(
            100% - var(--padding) * 2 - var(--small-dialog-padding) * 2
        );
        background: var(--popup-bg);
        box-shadow:
            0 0 0 2px var(--popup-stroke) inset,
            0 0 60px 10px var(--popup-bg);
        padding: var(--small-dialog-padding);
        margin: var(--padding);
        border-radius: 29px;
        position: relative;
        will-change: transform;
    }

    .open .small-dialog {
        animation: modal-in 0.35s;
    }

    .closing .small-dialog {
        animation: modal-out 0.15s;
        opacity: 0;
    }

    .small-dialog.meowbalt-visible {
        padding-top: calc(var(--padding) * 4);
    }

    .meowbalt-container {
        position: absolute;
        top: -120px;
    }

    .popup-header h2 {
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

    .body-text:focus-visible {
        box-shadow: none !important;
    }

    .popup-buttons {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: calc(var(--padding) / 2);
        overflow: scroll;
        border-radius: var(--border-radius);
    }

    .popup-button {
        width: 100%;
        height: 40px;
    }

    .popup-button.red {
        background-color: var(--red);
    }

    .popup-button:not(.active) {
        background-color: var(--button-elevated);
    }

    .popup-button:not(.active):active {
        background-color: var(--button-elevated-hover);
    }

    .popup-button:not(:focus-visible) {
        box-shadow: none;
    }

    @media (hover: hover) {
        .popup-button:not(.active):hover {
            background-color: var(--button-elevated-hover);
        }
    }

    #dialog-backdrop {
        --backdrop-opacity: 0.4;
        background-color: var(--popup-backdrop);
        position: inherit;
        height: 100%;
        width: 100%;
        z-index: -1;
        opacity: 0;
        animation: backdrop-in 0.15s;
    }

    :global([data-reduce-transparency="true"]) #dialog-backdrop {
        --backdrop-opacity: 0.5;
    }

    .open #dialog-backdrop {
        opacity: var(--backdrop-opacity);
        animation: backdrop-in 0.15s;
    }

    .closing #dialog-backdrop {
        opacity: 0;
        animation: backdrop-out 0.15s;
    }

    @keyframes modal-in {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        30% {
            opacity: 1;
        }
        50% {
            transform: scale(1.005);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes modal-out {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
            transform: scale(0.9);
            visibility: hidden;
        }
    }

    @keyframes backdrop-in {
        from {
            opacity: 0;
        }
        to {
            opacity: var(--backdrop-opacity);
        }
    }

    @keyframes backdrop-out {
        from {
            opacity: var(--backdrop-opacity);
        }
        to {
            opacity: 0;
        }
    }

    @media screen and (max-width: 535px) {
        dialog {
            justify-content: end;
        }

        .small-dialog {
            margin-bottom: calc(var(--padding) + env(safe-area-inset-bottom));
            box-shadow: 0 0 0 2px var(--popup-stroke) inset;
        }

        .open .small-dialog {
            animation: modal-in-mobile 0.4s;
        }

        @keyframes modal-in-mobile {
            from {
                transform: translateY(200px);
                opacity: 0;
            }
            30% {
                opacity: 1;
            }
            50% {
                transform: translateY(-5px);
            }
            100% {
                transform: translateY(0px);
            }
        }
    }
</style>
