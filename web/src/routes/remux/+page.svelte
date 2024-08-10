<script lang="ts">
    import FFmpegWrapper from "$lib/ffmpeg";

    import { openURL } from "$lib/download";

    const loadFile = async() => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "video/*,audio/*";

        fileInput.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const reader = new FileReader();

            if (target.files?.length === 1) {
                const file = target.files[0];
                const type = file.type.split("/")[0];
                const format = file.type.split("/")[1];

                if (!["video", "audio"].includes(type))
                    return;

                reader.readAsArrayBuffer(file);

                const fileBlob = URL.createObjectURL(
                    new Blob([file], { type: "video/mp4" })
                );

                const ff = new FFmpegWrapper();

                await ff.init();
                const render = await ff.renderFile(fileBlob, type, format);

                openURL(render);
            }
        };

        fileInput.click();
    };
</script>

<div id="remux-container">
    <button on:click={() => loadFile()}>
        load file
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
