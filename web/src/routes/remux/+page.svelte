<script lang="ts">
    import LibAVWrapper from "$lib/libav";
    import { openURL } from "$lib/download";

    import DragDropArea from "$components/misc/DragDropArea.svelte";
    import OpenFileButton from "$components/misc/OpenFileButton.svelte";

    let draggedOver = false;
    let file: File;

    const render = async () => {
        const ff = new LibAVWrapper();
        await ff.init();

        const render = await ff.render({
            blob: file,
            args: ["-c", "copy"],
        });

        if (render) {
            openURL(URL.createObjectURL(render));
        } else {
            console.log("not a valid file")
        }
    };

    $: if (file) {
        render();
    }
</script>

<DragDropArea id="remux-container" bind:draggedOver bind:file>
    <OpenFileButton bind:draggedOver bind:file />
</DragDropArea>

<style>
    :global(#remux-container) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
</style>
