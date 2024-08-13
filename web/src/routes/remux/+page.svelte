<script lang="ts">
    import LibAVWrapper from "$lib/libav";
    import { openURL } from "$lib/download";
    import { t } from "$lib/i18n/translations";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import OpenFileButton from "$components/misc/FileReceiver.svelte";

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
            console.log("not a valid file");
        }
    };

    $: if (file) {
        render();
    }
</script>

<DropReceiver id="remux-container" bind:draggedOver bind:file>
    <div id="remux-inner">
        <OpenFileButton
            bind:draggedOver
            bind:file
            acceptTypes={["video/*", "audio/*"]}
            acceptExtensions={[
                "mp4",
                "webm",
                "mp3",
                "ogg",
                "opus",
                "wav",
                "m4a",
            ]}
        />
        <div class="subtext remux-description">
            {$t("remux.description")}
        </div>
    </div>
</DropReceiver>

<style>
    :global(#remux-container) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    #remux-inner {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 450px;
        text-align: center;
        gap: 32px;
    }

    .remux-description {
        font-size: 14px;
        line-height: 1.5;
    }
</style>
