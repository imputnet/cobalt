<script lang="ts">
    import SmallDialog from "$components/dialog/SmallDialog.svelte";
</script>

<noscript style="display: contents">
    <div id="nojs-ack">
        <SmallDialog
            id="nojs-dialog"
            meowbalt="error"
            bodyText={
                "cobalt uses javascript for api requests and ui interactions, but it's not available in your browser. "
                + "you can still navigate around cobalt, but most functionality won't work."
            }
            buttons={[
                {
                    text: "got it",
                    main: true,
                    action: () => {},
                    link: "#nojs-ack"
                },
            ]}
        />
        <div id="nojs-dialog-backdrop"></div>
    </div>
</noscript>

<style>
    :global(#nojs-ack) {
        display: contents;
    }

    :global(#nojs-ack:target) {
        display: none;
    }

    #nojs-dialog-backdrop {
        opacity: 1;
    }
</style>
