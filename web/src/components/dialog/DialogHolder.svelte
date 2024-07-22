<script lang="ts">
    import dialogs from "$lib/dialogs";

    import SmallDialog from "$components/dialog/SmallDialog.svelte";
    import PickerDialog from "$components/dialog/PickerDialog.svelte";

    $: backdropVisible = $dialogs.length > 0;
</script>

<div id="dialog-holder">
    {#each $dialogs as dialog}
        {#if dialog.type === "small"}
            <SmallDialog
                id={dialog.id}
                title={dialog.title}
                meowbalt={dialog.meowbalt}
                icon={dialog.icon}
                bodyText={dialog.bodyText}
                bodySubText={dialog.bodySubText}
                buttons={dialog.buttons}
            />
        {:else if dialog.type === "picker"}
            <PickerDialog
                id={dialog.id}
                items={dialog.items}
                buttons={dialog.buttons}
            />
        {/if}
    {/each}
    <div id="dialog-backdrop" class:visible={backdropVisible}></div>
</div>

<style>
    :global(dialog) {
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

    :global(dialog:modal) {
        inset-block-start: 0;
        inset-block-end: 0;
    }

    :global(dialog:modal::backdrop) {
        display: none;
    }

    @media screen and (max-width: 535px) {
        :global(dialog) {
            justify-content: end;
        }
    }

    #dialog-holder {
        position: absolute;
        padding-top: env(safe-area-inset-bottom);
        height: 100%;
        width: 100%;
        z-index: 99;

        display: flex;
        justify-content: center;
        align-items: center;

        pointer-events: none;
    }

    #dialog-backdrop {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: -1;

        background-color: var(--dialog-backdrop);

        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);

        opacity: 0;
        transition: opacity 0.2s;
    }

    #dialog-backdrop.visible {
        opacity: 1;
    }

    :global([data-reduce-transparency="true"]) #dialog-backdrop {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }

    :global(.open .dialog-body) {
        animation: modal-in 0.35s;
    }

    :global(.closing .dialog-body) {
        animation: modal-out 0.15s;
        opacity: 0;
    }

    @media screen and (max-width: 535px) {
        :global(.open .dialog-body) {
            animation: modal-in-mobile 0.4s;
        }
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
</style>
