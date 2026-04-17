<script lang="ts">
    import Skeleton from "$components/misc/Skeleton.svelte";
    import type { CobaltQueueItemRunning, UUID } from "$lib/types/queue";

    type Props = {
        percentage?: number;
        workerId: UUID;
        pipelineResults: CobaltQueueItemRunning['pipelineResults'];
    }

    let { percentage = 0, workerId, pipelineResults }: Props = $props();
</script>

<div class="file-progress">
    {#if percentage}
        <div
            class="progress"
            style="width: {Math.min(100, percentage)}%"
        ></div>
    {:else if pipelineResults[workerId]}
        <div
            class="progress"
            style="width: 100%"
        ></div>
    {:else}
        <Skeleton
            height="6px"
            width="100%"
            class="elevated indeterminate-progress"
        />
    {/if}
</div>

<style>
    .file-progress {
        width: 100%;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border-light);
    }

    .file-progress,
    .file-progress .progress {
        height: 6px;
        border-radius: 10px;
        transition: width 0.15s ease;
    }

    .file-progress :global(.indeterminate-progress) {
        display: block;
    }

    .file-progress .progress {
        background: var(--gradient-orange);
        box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
    }
</style>
