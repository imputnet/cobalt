<script lang="ts">
    import { tick } from "svelte";
    import { killDialog } from "$lib/dialogs";

    export let id: string;

    let dialogParent: HTMLDialogElement;

    let open = false;
    let closing = false;

    export const close = () => {
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
    <slot></slot>
</dialog>
