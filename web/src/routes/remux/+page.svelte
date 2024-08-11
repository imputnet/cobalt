<script lang="ts">
    import FFmpegWrapper from "$lib/ffmpeg";

    import { openURL } from "$lib/download";

    $: draggedOver = false;

    const dropHandler = async (ev: DragEvent) => {
        draggedOver = false;
        ev.preventDefault();

        if (ev?.dataTransfer?.files.length === 1) {
            const file = ev.dataTransfer.files[0];

            await render(file);
        }
    };

    const dragOverHandler = (ev: DragEvent) => {
        draggedOver = true;
        ev.preventDefault();
    };

    const render = async (file: File) => {
        const type = file.type.split("/")[0];
        const format = file.type.split("/")[1];

        if (!["video", "audio"].includes(type)) return;

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        const fileBlob = URL.createObjectURL(
            new Blob([file], { type: `${type}/${format}` })
        );

        const ff = new FFmpegWrapper();
        await ff.init();

        const render = await ff.renderFile({
            url: fileBlob,
            input: {
                type,
                format,
            },
            output: {
                type,
                format,
            },
            args: ["-c", "copy"],
        });

        openURL(render);
    };

    const openFile = async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "video/*,audio/*";

        fileInput.click();

        fileInput.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;

            if (target.files?.length === 1) {
                const file = target.files[0];
                await render(file);
            }
        };
    };
</script>

<div
    id="remux-container"
    role="region"
    on:drop={(ev) => dropHandler(ev)}
    on:dragover={(ev) => dragOverHandler(ev)}
    on:dragend={() => {
        draggedOver = false;
    }}
>
    <button on:click={() => openFile()}>
        {#if draggedOver}
            drop the file!
        {:else}
            open the file
        {/if}
    </button>
</div>

<style>
    #remux-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
</style>
