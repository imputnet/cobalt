<script lang="ts">
    import RemuxWorker from "$lib/workers/remux?worker";

    import { beforeNavigate, goto } from "$app/navigation";

    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/state/dialogs";
    import { downloadFile } from "$lib/download";

    import Skeleton from "$components/misc/Skeleton.svelte";
    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";
    import BulletExplain from "$components/misc/BulletExplain.svelte";

    import IconRepeat from "@tabler/icons-svelte/IconRepeat.svelte";
    import IconDevices from "@tabler/icons-svelte/IconDevices.svelte";
    import IconInfoCircle from "@tabler/icons-svelte/IconInfoCircle.svelte";

    let draggedOver = false;
    let file: File | undefined;

    let speed: number | undefined;
    let progress: string | undefined;
    let currentProgress: string | undefined;

    let wentAway = false;

    let processing = false;

    let worker: Worker;

    const remux = async () => {
        worker = new RemuxWorker();

        speed = undefined;
        progress = undefined;
        currentProgress = undefined;

        worker.postMessage({ file });
        processing = true;

        worker.onerror = (e) => {
            console.error("remux worker exploded:", e);
            worker.terminate();
        };

        worker.onmessage = (event) => {
            console.log(event.data);

            if (event.data.progress) {
                let eprogress = event.data.progress;

                if (eprogress?.speed) {
                    speed = eprogress.speed;
                }

                if (eprogress?.durationProcessed) {
                    currentProgress = eprogress.durationProcessed;
                }

                if (eprogress?.duration && eprogress?.durationProcessed) {
                    progress = Math.max(
                        0,
                        Math.min(
                            100,
                            (eprogress.durationProcessed / eprogress.duration) *
                                100
                        )
                    ).toFixed(2);
                }

                console.log(eprogress, progress, speed, currentProgress);
            }

            if (event.data.render) {
                processing = false;
                worker.terminate();
                return downloadFile({
                    file: new File([event.data.render], event.data.filename, {
                        type: event.data.render.type,
                    }),
                });
            }

            if (event.data.error) {
                processing = false;
                worker.terminate();

                return createDialog({
                    id: "remux-error",
                    type: "small",
                    meowbalt: "error",
                    bodyText: $t(event.data.error),
                    buttons: [
                        {
                            text: $t("button.gotit"),
                            main: true,
                            action: () => {},
                        },
                    ],
                });
            }
        };
    };

    beforeNavigate((event) => {
        if (processing && !wentAway) {
            event.cancel();
            const path = event.to?.route?.id;

            if (path) {
                return createDialog({
                    id: "remux-ongoing",
                    type: "small",
                    icon: "warn-red",
                    title: $t("dialog.processing.title.ongoing"),
                    bodyText: $t("dialog.processing.ongoing"),
                    buttons: [
                        {
                            text: $t("button.no"),
                            main: false,
                            action: () => {},
                        },
                        {
                            text: $t("button.yes"),
                            main: true,
                            color: "red",
                            action: async () => {
                                worker.terminate();
                                wentAway = true;
                                goto(path);
                            },
                        },
                    ],
                });
            }
        }
    });
</script>

<svelte:head>
    <title>{$t("tabs.remux")} ~ {$t("general.cobalt")}</title>
    <meta
        property="og:title"
        content="{$t('tabs.remux')} ~ {$t('general.cobalt')}"
    />
</svelte:head>

<DropReceiver
    bind:file
    bind:draggedOver
    id="remux-container"
    classes={processing ? "processing" : ""}
>
    <div
        id="remux-open"
        class:processing
        tabindex="-1"
        data-first-focus
        data-focus-ring-hidden
    >
        <div id="remux-receiver">
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

            {#if file}
                <div class="button-row">
                    <button on:click={remux}>remux</button>
                    <button
                        on:click={() => {
                            file = undefined;
                        }}
                    >
                        clear imported files
                    </button>
                </div>
            {/if}
        </div>

        <div id="remux-bullets">
            <BulletExplain
                title={$t("remux.bullet.purpose.title")}
                description={$t("remux.bullet.purpose.description")}
                icon={IconRepeat}
            />

            <BulletExplain
                title={$t("remux.bullet.explainer.title")}
                description={$t("remux.bullet.explainer.description")}
                icon={IconInfoCircle}
            />

            <BulletExplain
                title={$t("remux.bullet.privacy.title")}
                description={$t("remux.bullet.privacy.description")}
                icon={IconDevices}
            />
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
                {:else if currentProgress && speed}
                    <div class="progress-text">
                        processing ({currentProgress}s, {speed}x)...
                    </div>
                {:else}
                    <div class="progress-text">processing...</div>
                {/if}
                <button
                    on:click={() => {
                        file = undefined;
                        processing = false;
                        worker?.terminate();
                    }}
                >
                    cancel
                </button>
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
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 48px;
        transition:
            transform 0.2s,
            opacity 0.2s;
    }

    #remux-processing {
        position: absolute;
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: scale(0.9);
        transition:
            transform 0.2s,
            opacity 0.2s;
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
        align-items: center;
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

    #remux-receiver {
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    #remux-bullets {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 450px;
    }

    .button-row {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    button {
        padding: 12px 24px;
        border-radius: 200px;
        width: fit-content;
    }

    @media screen and (max-width: 920px) {
        #remux-open {
            flex-direction: column;
            gap: var(--padding);
        }

        #remux-bullets {
            padding: var(--padding);
        }
    }

    @media screen and (max-width: 535px) {
        .progress-bar {
            width: 350px;
        }

        #remux-bullets {
            gap: var(--padding);
        }
    }

    @media screen and (max-height: 750px) and (max-width: 535px) {
        :global(#remux-container:not(.processing)) {
            justify-content: start;
            align-items: start;
            padding-top: var(--padding);
        }
    }
</style>
