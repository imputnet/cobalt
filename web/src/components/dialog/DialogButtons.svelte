<script lang="ts">
    import type { DialogButton as DialogButtonType } from "$lib/types/dialog";
    import DialogButton from "$components/dialog/DialogButton.svelte";

    export let buttons: DialogButtonType[];
    export let closeFunc: () => void;
</script>

<div class="popup-buttons">
    {#each buttons as button}
        <DialogButton {button} {closeFunc} />
    {/each}
</div>

<style>
    .popup-buttons {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: calc(var(--padding) / 2);
        overflow: scroll;
        border-radius: var(--border-radius);
        min-height: 40px;
    }
</style>
