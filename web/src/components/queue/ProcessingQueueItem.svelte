<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { formatFileSize } from "$lib/util";
    import { downloadFile } from "$lib/download";
    import { removeItem } from "$lib/state/queen-bee/queue";

    import type { CobaltQueueItem } from "$lib/types/queue";
    import type { CobaltCurrentTaskItem } from "$lib/types/queen-bee";

    import ProgressBar from "$components/queue/ProgressBar.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";
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

    $: progress = runningWorker?.progress;
    $: size = formatFileSize(runningWorker?.progress?.size);

    const download = (file: File) =>
        downloadFile({
            file: new File([file], info.filename, {
                type: info.mimeType,
            }),
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

        <div class="file-status {info.state}">
            {#if info.state === "done"}
                <IconCheck /> {formatFileSize(info.resultFile?.file?.size)}
            {/if}

            {#if info.state === "running"}
                {#if info.pipeline.length > 1}
                    {(info.completedWorkers?.length || 0) + 1}/{info.pipeline.length}
                {/if}
                {#if runningWorker && progress && progress.percentage}
                    {$t(`queue.state.running.${runningWorker.type}`)}: {Math.ceil(
                        progress.percentage
                    )}%, {size}
                {:else if runningWorker && progress && size}
                    {$t(`queue.state.running.${runningWorker.type}`)}: {size}
                {:else}
                    {$t("queue.state.starting")}
                {/if}
            {/if}

            {#if info.state === "error"}
                <IconExclamationCircle /> {info.errorCode}
            {/if}

            {#if info.state === "waiting"}
                {$t("queue.state.waiting")}
            {/if}
        </div>
    </div>

    <div class="file-actions">
        {#if info.state === "done" && info.resultFile}
            <button
                class="action-button"
                on:click={() => download(info.resultFile.file)}
            >
                <IconDownload />
            </button>
        {/if}
        <button class="action-button" on:click={() => removeItem(id)}>
            <IconX />
        </button>
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
        overflow: hidden;
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
        gap: 6px;
    }

    .file-status.error {
        color: var(--medium-red);
    }

    .file-status :global(svg) {
        width: 16px;
        height: 16px;
        stroke-width: 2px;
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
