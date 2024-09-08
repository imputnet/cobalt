<script lang="ts">
    import mime from "mime";
    import LibAVWrapper from "$lib/libav";
    import { browser } from "$app/environment";
    import { beforeNavigate } from "$app/navigation";

    import { device } from "$lib/device";
    import { openURL } from "$lib/download";
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/dialogs";

    import Skeleton from "$components/misc/Skeleton.svelte";
    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";

    let draggedOver = false;
    let file: File | undefined;

    let totalDuration: number | undefined;
    let processedDuration: number | undefined;

    let speed: number | undefined;
    let progress: string | undefined;

    $: {
        if (totalDuration && processedDuration) {
            const percentage = Math.max(
                0,
                Math.min(100, (processedDuration / totalDuration) * 100)
            ).toFixed(2);
            progress = percentage;
        } else if (processing) {
            progress = undefined;
            speed = undefined;
        } else {
            progress = undefined;
            speed = undefined;
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

        let dialogOpened;
        try {
            progress = undefined;
            speed = undefined;
            processing = true;

            const file_info = await ff.probe(file).catch(e => {
                if (e?.message?.toLowerCase().includes("out of memory")) {
                    console.error("uh oh! out of memory");
                    console.error(e);

                    dialogOpened = true;
                    return createDialog({
                        id: "remux-error",
                        type: "small",
                        meowbalt: "error",
                        bodyText: $t("error.remux.out_of_resources"),
                        buttons: [
                            {
                                text: $t("button.gotit"),
                                main: true,
                                action: () => {},
                            },
                        ],
                    });
                }
            });

            if (!file_info?.format) {
                if (!dialogOpened)
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
                return;
            }

            totalDuration = Number(file_info.format.duration);

            if (file instanceof File && !file.type) {
                file = new File([ file ], file.name, {
                    type: mime.getType(file.name) ?? undefined,
                });
            }

            const render = await ff
                .render({
                    blob: file,
                    args: ["-c", "copy", "-map", "0"],
                })
                .catch((e) => {
                    console.error("uh-oh! render error");
                    console.error(e);
                    return createDialog({
                        id: "remux-error",
                        type: "small",
                        meowbalt: "error",
                        bodyText: $t("error.remux.out_of_resources"),
                        buttons: [
                            {
                                text: $t("button.gotit"),
                                main: true,
                                action: () => {},
                            },
                        ],
                    });
                });

            if (render) {
                if (device.is.iOS) {
                    return await navigator.share({
                        files: [
                            new File([ render ], file.name, { type: render.type })
                        ]
                    }).catch(() => {});
                }

                openURL(URL.createObjectURL(render));
            } else {
                console.log("not a valid file");
            }
        } finally {
            processing = false;
            file = undefined;
            progress = undefined;
            speed = undefined;
        }
    };

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
        event.preventDefault();
    };

    beforeNavigate((event) => {
        if (processing) {
            event.cancel();
            //TODO: show a popup with an option to kill ongoing processing
        }
    });

    $: if (browser && processing) {
        window.addEventListener("beforeunload", beforeUnloadHandler);
    } else if (browser) {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
    }

    $: if (file) {
        render();
    }
</script>

<svelte:head>
    <title>{$t("tabs.remux")} ~ {$t("general.cobalt")}</title>
</svelte:head>

<DropReceiver id="remux-container" bind:draggedOver bind:file>
    <div
        id="remux-open"
        class:processing
        tabindex="-1"
        data-first-focus
        data-focus-ring-hidden
    >
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

    <div id="remux-processing" class:processing aria-hidden={!processing}>
        <div id="processing-status">
            {#if processing}
                {#if progress && speed}
                    <div class="progress-bar">
                        <Skeleton
                            width="{progress}%"
                            height="20px"
                            class="elevated"
                        />
                    </div>
                    <div class="progress-text">
                        processing ({progress}%, {speed}x)...
                    </div>
                {:else}
                    processing...
                {/if}
            {:else}
                done!
            {/if}
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
        flex-direction: column;
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

    #processing-status {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--padding);
        justify-content: center;
    }

    .progress-bar {
        height: 20px;
        width: 400px;
        max-width: 400px;
        border-radius: 6px;
        background: var(--button);
    }

    .progress-text {
        font-size: 14px;
        text-align: center;
    }

    .remux-description {
        font-size: 14px;
        line-height: 1.5;
    }

    @media screen and (max-width: 535px) {
        .remux-description {
            font-size: 12px;
        }

        .progress-bar {
            width: 350px;
        }
    }
</style>
