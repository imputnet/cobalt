<script lang="ts">
    import SmallDialog from "./SmallDialog.svelte";
    import dialogs from "$lib/dialogs";
</script>

<div id="dialog-holder" aria-hidden="true">
    {#each $dialogs as dialog}
        {#if dialog.type === "small"}
            <SmallDialog
                id={dialog.id}
                title={dialog.title}
                bodyText={dialog.bodyText}
                bodySubText={dialog.bodySubText}
                buttons={dialog.buttons}
            />
        {/if}
    {/each}
</div>

<style>
    #dialog-holder {
        position: absolute;
        padding-top: env(safe-area-inset-bottom);
        height: calc(100%);
        width: 100%;
        pointer-events: none;
    }
</style>
