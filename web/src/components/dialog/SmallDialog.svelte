<script lang="ts">
    import { killDialog } from "$lib/dialogs";
    import type { DialogButton } from "$lib/types/dialog";

    export let id: string;
    export let title: string = "";
    export let bodyText: string = "";
    export let bodySubText: string = "";
    export let buttons: DialogButton[];

    let dialogParent: HTMLDialogElement;

    const close = () => {
        if (dialogParent) {
            dialogParent.close();
            killDialog();
        }
    }

    $: if (dialogParent) {
        dialogParent.showModal();
    }
</script>

<dialog id="dialog-{id}" bind:this={dialogParent} class="small-dialog">
    <div class="popup-header">
        <h2>{title}</h2>
    </div>
    <div class="popup-body">
        {bodyText}
        {#if bodySubText}
            <div class="subtext">{bodySubText}</div>
        {/if}
    </div>
    <div class="popup-buttons">
        {#each buttons as button}
            <button
                on:click={
                    (async() => {
                        await button.action();
                        close();
                    })
                }
            >
                {button.text}
            </button>
        {/each}
    </div>
</dialog>

<style>
    .small-dialog {
        max-width: 375px;
    }
</style>
