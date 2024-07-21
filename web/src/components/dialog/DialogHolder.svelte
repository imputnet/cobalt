<script lang="ts">
    import SmallDialog from "$components/dialog/SmallDialog.svelte";
    import dialogs from "$lib/dialogs";

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
        {/if}
    {/each}
    <div id="dialog-backdrop" class:visible={backdropVisible}></div>
</div>

<style>
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
</style>
