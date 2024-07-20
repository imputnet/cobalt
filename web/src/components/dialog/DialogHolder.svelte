<script lang="ts">
    import SmallDialog from "./SmallDialog.svelte";
    import dialogs from "$lib/dialogs";

    $: dialogVisible = $dialogs.length > 0;
</script>

<div id="dialog-holder" class:visible={dialogVisible}>
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
        {/if}
    {/each}
</div>

<style>
    #dialog-holder {
        position: absolute;
        padding-top: env(safe-area-inset-bottom);
        height: 100%;
        width: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99;

        visibility: hidden;
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
    }

    #dialog-holder.visible {
        visibility: visible;
    }

    :global([data-reduce-transparency="true"]) #dialog-holder {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }
</style>
