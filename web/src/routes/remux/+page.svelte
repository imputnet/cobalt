<script lang="ts">
    import LibAVWrapper from "$lib/libav";
    import { openURL } from "$lib/download";
    import { t } from "$lib/i18n/translations";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";
    import { createDialog } from "$lib/dialogs";
    import mime from "mime";

    let draggedOver = false;
    let file: File | Blob | undefined;

    let totalDuration: number | undefined;
    let processedDuration: number | undefined;
    let speed: number | undefined;
    let progress = '';

    $: {
        if (totalDuration && processedDuration) {
            const percentage = Math.max(0, Math.min(100, (processedDuration / totalDuration) * 100)).toFixed(2);
            progress = `${percentage}%, ${speed}x`;
        } else if (processing) {
            progress = 'getting video metadata';
        } else {
            progress = '';
        }
    }

    let processing = false;

    const ff = new LibAVWrapper(progress => {
        if (progress.out_time_sec) {
            processedDuration = progress.out_time_sec;
        }

        if (progress.speed) {
            speed = progress.speed;
        }
    });

    ff.init();

    const render = async () => {
        if (!file || processing) return;
        await ff.init();
        try {
            progress = '';
            processing = true;

            const file_info = await ff.probe(file);
            if (!file_info?.format) {
                return createDialog({
                    id: "remux-error",
                    type: "small",
                    meowbalt: "error",
                    bodyText: $t("error.remux.corrupted"),
                    buttons: [
                        {
                            text: $t("button.gotit"),
                            main: true,
                            action: () => {},
                        },
                    ],
                });
            }

            totalDuration = Number(file_info.format.duration);

            if (file instanceof File && !file.type) {
                file = new Blob([ file ], {
                    type: mime.getType(file.name) ?? undefined
                });
            }

            const render = await ff.render({
                blob: file,
                args: ['-c', 'copy', '-map', '0']
            });

            if (render) {
                openURL(URL.createObjectURL(render));
            } else {
                console.log("not a valid file");
            }

        } finally {
            processing = false;
            file = undefined;
        }
    };

    $: if (file) {
        render();
    }
</script>

<svelte:head>
    <title>{$t("tabs.remux")} ~ {$t("general.cobalt")}</title>
</svelte:head>

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
            processing{progress ? ` (${(progress)})` : ''}...
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
        gap: 24px;
        transition: transform 0.2s, opacity 0.2s;
    }

    #remux-processing {
        position: absolute;
        display: flex;
        opacity: 0;
        transform: scale(0.9);
        transition: transform 0.2s, opacity 0.2s;
        pointer-events: none;
    }

    #remux-processing.processing {
        opacity: 1;
        transform: none;
    }

    #remux-open.processing {
        transform: scale(0.9);
        opacity: 0;
        pointer-events: none;
    }

    .remux-description {
        font-size: 14px;
        line-height: 1.5;
    }

    @media screen and (max-width: 535px) {
        .remux-description {
            font-size: 12px;
        }
    }
</style>
