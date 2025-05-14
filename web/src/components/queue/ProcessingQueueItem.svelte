<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { formatFileSize } from "$lib/util";
    import { downloadFile } from "$lib/download";
    import { removeItem } from "$lib/state/task-manager/queue";
    import { savingHandler } from "$lib/api/saving-handler";

    import type { CobaltQueueItem } from "$lib/types/queue";
    import type { CobaltWorkerProgress } from "$lib/types/workers";
    import type { CobaltCurrentTaskItem } from "$lib/types/task-manager";

    import ProgressBar from "$components/queue/ProgressBar.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";
    import IconReload from "@tabler/icons-svelte/IconReload.svelte";
    import IconLoader2 from "@tabler/icons-svelte/IconLoader2.svelte";
    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";
    import IconExclamationCircle from "@tabler/icons-svelte/IconExclamationCircle.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";

    const itemIcons = {
        video: IconMovie,
        audio: IconMusic,
        image: IconPhoto,
    };

    export let id: string;
    export let info: CobaltQueueItem;
    export let runningWorker: CobaltCurrentTaskItem | undefined;
    export let runningWorkerId: string | undefined;

    let retrying = false;

    const retry = async (info: CobaltQueueItem) => {
        if (info.canRetry && info.originalRequest) {
            retrying = true;
            await savingHandler({
                request: info.originalRequest,
            });
            retrying = false;
        }
    };

    const download = (file: File) =>
        downloadFile({
            file: new File([file], info.filename, {
                type: info.mimeType,
            }),
        });

    $: progress = runningWorker?.progress;

    type StatusText = {
        info: CobaltQueueItem;
        runningWorker: CobaltCurrentTaskItem | undefined;
        progress: CobaltWorkerProgress | undefined;
        retrying: boolean;
    };

    const generateStatusText = ({ info, runningWorker, progress, retrying }: StatusText) => {
        switch (info.state) {
        case "running":
            if (runningWorker) {
                const running = $t(`queue.state.running.${runningWorker.type}`);
                const formattedSize = formatFileSize(progress?.size);

                if (progress && progress.percentage) {
                    return `${running}: ${Math.ceil(progress.percentage)}%, ${formattedSize}`;
                }
                else if (runningWorker && progress) {
                    if (progress.size > 0) {
                        return `${running}: ${formattedSize}`;
                    }
                    return running;
                }
                else if (runningWorker?.type) {
                    const starting = $t(`queue.state.starting.${runningWorker.type}`);

                    if (info.pipeline.length > 1) {
                        const currentPipeline = info.completedWorkers.size + 1;
                        return `${starting} (${currentPipeline}/${info.pipeline.length})`;
                    }
                    return starting;
                }
            }
            return $t("queue.state.starting");

        case "done":
            return formatFileSize(info.resultFile?.size);

        case "error":
            return !retrying ? $t(`error.${info.errorCode}`) : $t("queue.state.retrying");

        case "waiting":
            return $t("queue.state.waiting");
        }
    };

    /*
        params are passed here because svelte will re-run
        the function every time either of them is changed,
        which is what we want in this case :3
    */
    $: statusText = generateStatusText({
        info,
        runningWorker,
        progress,
        retrying,
    });
</script>

<div class="processing-item">
    <div class="processing-info">
        <div class="file-title">
            <div class="processing-type">
                <svelte:component this={itemIcons[info.mediaType]} />
            </div>
            <span class="filename">
                {info.filename}
            </span>
        </div>

        {#if info.state === "running"}
            <div class="progress-holder">
                {#each info.pipeline as pipeline}
                    <ProgressBar
                        percentage={progress?.percentage}
                        workerId={pipeline.workerId}
                        {runningWorkerId}
                        completedWorkers={info.completedWorkers}
                    />
                {/each}
            </div>
        {/if}

        <div class="file-status {info.state}" class:retrying>
            <div class="status-icon">
                {#if info.state === "done"}
                    <IconCheck />
                {/if}
                {#if info.state === "error" && !retrying}
                    <IconExclamationCircle />
                {/if}
                {#if info.state === "running" || retrying}
                    <div class="status-spinner">
                        <IconLoader2 />
                    </div>
                {/if}
            </div>

            <div class="status-text">
                {statusText}
            </div>
        </div>
    </div>

    <div class="file-actions">
        {#if info.state === "done" && info.resultFile}
            <button
                class="button action-button"
                on:click={() => download(info.resultFile)}
            >
                <IconDownload />
            </button>
        {/if}

        {#if !retrying}
            {#if info.state === "error" && info?.canRetry}
                <button
                    class="button action-button"
                    on:click={() => retry(info)}
                >
                    <IconReload />
                </button>
            {/if}
            <button
                class="button action-button"
                on:click={() => removeItem(id)}
            >
                <IconX />
            </button>
        {/if}
    </div>
</div>

<style>
    .processing-item,
    .file-actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        position: relative;
    }

    .processing-item {
        width: 100%;
        padding: 8px 0;
        gap: 8px;
        border-bottom: 1.5px var(--button-elevated) solid;
    }

    .processing-type {
        display: flex;
    }

    .processing-type :global(svg) {
        width: 18px;
        height: 18px;
        stroke-width: 1.5px;
    }

    .processing-info {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-size: 13px;
        gap: 4px;
        font-weight: 500;
    }

    .progress-holder {
        display: flex;
        flex-direction: row;
        gap: 2px;
    }

    .file-title {
        display: flex;
        flex-direction: row;
        gap: 4px;
        line-break: anywhere;
    }

    .filename {
        overflow: hidden;
        white-space: pre;
        text-overflow: ellipsis;
    }

    .file-status {
        font-size: 12px;
        color: var(--gray);
        line-break: anywhere;
        display: flex;
        align-items: center;
    }

    .file-status.error:not(.retrying) {
        color: var(--medium-red);
    }

    .file-status :global(svg) {
        width: 16px;
        height: 16px;
        stroke-width: 2px;
    }

    .status-icon,
    .status-spinner,
    .status-text {
        display: flex;
    }

    .status-text {
        line-break: normal;
    }

    /*
        margin is used instead of gap cuz queued state doesn't have an icon.
        margin is applied only to the visible icon, so there's no awkward gap.
    */
    .status-icon :global(svg) {
        margin-right: 6px;
    }

    :global([dir="rtl"]) .status-icon :global(svg) {
        margin-left: 6px;
        margin-right: 0;
    }

    .status-spinner :global(svg) {
        animation: spinner 0.7s infinite linear;
        will-change: transform;
    }

    .file-actions {
        gap: 4px;
    }

    @media (hover: hover) {
        .file-actions {
            position: absolute;
            right: 0;
            background-color: var(--button);
            height: 90%;
            padding-left: 18px;

            visibility: hidden;
            opacity: 0;
            transition: opacity 0.2s;

            mask-image: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(0, 0, 0, 1) 20%
            );
        }

        :global([dir="rtl"]) .file-actions {
            left: 0;
            right: unset;
            padding-left: 0;
            padding-right: 18px;
            mask-image: linear-gradient(
                -90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(0, 0, 0, 1) 20%
            );
        }

        .processing-item:hover .file-actions {
            visibility: visible;
            opacity: 1;
        }
    }

    @media (hover: none) {
        .processing-info {
            overflow: hidden;
            flex: 1;
        }
    }

    .action-button {
        padding: 8px;
        height: auto;
        box-shadow: none;
    }

    .action-button :global(svg) {
        width: 18px;
        height: 18px;
        stroke-width: 1.5px;
    }

    .processing-item:first-child {
        padding-top: 0;
    }

    .processing-item:last-child {
        padding-bottom: 16px;
        border: none;
    }
</style>
