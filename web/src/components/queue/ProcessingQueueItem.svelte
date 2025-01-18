<script lang="ts">
    import { queue, removeItem } from "$lib/state/queen-bee/queue";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import { downloadFile } from "$lib/download";
    import type { CobaltQueueItemState } from "$lib/types/queue";
    import type { CobaltPipelineResultFileType } from "$lib/types/workers";

    const itemIcons = {
        video: IconMovie,
        audio: IconMusic,
        image: IconPhoto,
    };

    export let id: string;
    export let mediaType: CobaltPipelineResultFileType;
    export let filename: string;
    export let state: CobaltQueueItemState;
    export let resultFile: File | undefined;

    // TODO: use a real value
    const progress = 0;

    const download = (file: File) =>
        downloadFile({
            file,
        });
</script>

<div class="processing-item">
    <div class="processing-info">
        <div class="file-title">
            <div class="processing-type">
                <svelte:component this={itemIcons[mediaType]} />
            </div>
            <span>
                {filename}
            </span>
        </div>
        {#if state === "running"}
            <div class="file-progress">
                <div
                    class="progress"
                    style="width: {Math.min(100, progress)}%"
                ></div>
            </div>
        {/if}
        <div class="file-status">{id}: {state}</div>
    </div>
    <div class="file-actions">
        {#if state === "done" && resultFile}
            <button
                class="action-button"
                on:click={() => download(resultFile)}
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
        justify-content: center;
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

    .file-progress {
        width: 100%;
        background-color: var(--button-elevated);
    }

    .file-progress,
    .file-progress .progress {
        height: 6px;
        border-radius: 10px;
    }

    .file-progress .progress {
        background-color: var(--blue);
    }

    .file-title {
        display: flex;
        flex-direction: row;
        gap: 4px;
    }

    .file-status {
        font-size: 12px;
        color: var(--gray);
        line-break: anywhere;
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
