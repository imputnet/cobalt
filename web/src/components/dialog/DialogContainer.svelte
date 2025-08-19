<script lang="ts">
    import { tick } from "svelte";
    import { killDialog } from "$lib/state/dialogs";

    import DialogBackdropClose from "$components/dialog/DialogBackdropClose.svelte";

    export let id: string;
    export let dismissable = true;
    export let onclose: (e: Event) => void = () => {}

    let dialogParent: HTMLDialogElement;

    let open = false;
    let closing = false;

    export const close = () => {
        if (dialogParent) {
            closing = true;
            open = false;

            // wait 150ms for the closing animation to finish
            setTimeout(() => {
                // check if dialog parent is still present
                if (dialogParent) {
                    dialogParent.close();
                    killDialog();
                }
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

<dialog id="dialog-{id}" bind:this={dialogParent} class:closing class:open {onclose}>
    <slot></slot>
    <DialogBackdropClose closeFunc={dismissable ? close : () => {}} />
</dialog>
