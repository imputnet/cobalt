<script lang="ts">
    import LibAVWrapper from "$lib/libav";
    import { openURL } from "$lib/download";
    import { t } from "$lib/i18n/translations";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";

    let draggedOver = false;
    let file: File | undefined;

    let processing = false;

    const render = async () => {
        if (!file || processing) return;

        const ff = new LibAVWrapper();
        await ff.init();

        processing = true;

        const render = await ff.render({
            blob: file,
            args: ["-c", "copy"],
        });

        processing = false;

        if (render) {
            openURL(URL.createObjectURL(render));
        } else {
            console.log("not a valid file");
        }

        file = undefined;
    };

    $: if (file) {
        render();
    }
</script>

<DropReceiver id="remux-container" bind:draggedOver bind:file>
    <div id="remux-open" class:processing>
        <FileReceiver
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

    <div id="remux-processing" class:processing>
        {#if processing}
            processing...
        {:else}
            done!
        {/if}
    </div>
</DropReceiver>

<style>
    :global(#remux-container) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    #remux-open {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 450px;
        text-align: center;
        gap: 32px;
        transition: transform 0.2s, opacity 0.2s;
    }

    #remux-processing {
        position: absolute;
        display: flex;
        opacity: 0;
        transform: scale(0.9);
        transition: transform 0.2s, opacity 0.2s;
    }

    #remux-processing.processing {
        opacity: 1;
        transform: none;
    }

    #remux-open.processing {
        transform: scale(0.9);
        opacity: 0;
    }

    .remux-description {
        font-size: 14px;
        line-height: 1.5;
    }
</style>
