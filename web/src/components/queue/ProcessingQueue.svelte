<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { onNavigate } from "$app/navigation";
    import { onMount, type SvelteComponent } from "svelte";

    import { clearFileStorage } from "$lib/storage";
    import { currentTasks } from "$lib/state/queen-bee/current-tasks";
    import { clearQueue, queue as readableQueue } from "$lib/state/queen-bee/queue";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import PopoverContainer from "$components/misc/PopoverContainer.svelte";
    import ProcessingStatus from "$components/queue/ProcessingStatus.svelte";
    import ProcessingQueueItem from "$components/queue/ProcessingQueueItem.svelte";
    import ProcessingQueueStub from "$components/queue/ProcessingQueueStub.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";

    let popover: SvelteComponent;
    $: expanded = false;

    $: queue = Object.entries($readableQueue);

    const totalItemProgress = (completed: number, current: number, total: number) => {
        return (completed * 100 + current) / total
    }

    $: totalProgress = queue.length ? queue.map(([, item]) => {
        if (item.state === "done" || item.state === "error") {
            return 100;
        } else if (item.state === "running") {
            return totalItemProgress(
                item.completedWorkers?.length || 0,
                $currentTasks[item.runningWorker]?.progress?.percentage || 0,
                item.pipeline.length || 0
            );
        }
        return 0;
    }).reduce((a, b) => a + b) / (100 * queue.length) : 0;

    $: indeterminate = queue.length > 0 && totalProgress === 0;

    const popoverAction = async () => {
        expanded = !expanded;
    };

    onNavigate(() => {
        expanded = false;
    });

    onMount(() => {
        // clear old files from storage on first page load
        clearFileStorage();
    })
</script>

<div id="processing-queue" class:expanded>
    <ProcessingStatus
        progress={totalProgress * 100}
        {indeterminate}
        expandAction={popover?.showPopover}
    />

    <PopoverContainer
        bind:this={popover}
        id="processing-popover"
        {expanded}
        {popoverAction}
        expandStart="right"
    >
        <div id="processing-header">
            <SectionHeading
                title={$t("queue.title")}
                sectionId="queue"
                beta
                nolink
            />
            <div class="header-buttons">
                {#if queue.length}
                    <button class="clear-button" on:click={clearQueue}>
                        <IconX />
                        {$t("button.clear")}
                    </button>
                {/if}
            </div>
        </div>
        <div id="processing-list">
            {#each queue as [id, item]}
                <ProcessingQueueItem
                    {id}
                    info={item}
                    runningWorker={
                        item.state === "running" ? $currentTasks[item.runningWorker] : undefined
                    }
                    runningWorkerId={
                        item.state === "running" ? item.runningWorker : undefined
                    }
                />
            {/each}
            {#if queue.length === 0}
                <ProcessingQueueStub />
            {/if}
        </div>
    </PopoverContainer>
</div>

<style>
    #processing-queue {
        --holder-padding: 16px;
        position: absolute;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: end;
        z-index: 9;
        pointer-events: none;
        padding: var(--holder-padding);
        width: calc(100% - var(--holder-padding) * 2);
    }

    #processing-queue :global(#processing-popover) {
        gap: 12px;
        padding: 16px;
        padding-bottom: 0;
        width: calc(100% - 16px * 2);
        max-width: 425px;
    }

    #processing-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
    }

    .header-buttons {
        display: flex;
        flex-direction: row;
        gap: var(--padding);
    }

    .header-buttons button {
        font-size: 13px;
        font-weight: 500;
        padding: 0;
        background: none;
        box-shadow: none;
        text-align: left;
        border-radius: 3px;
    }

    .header-buttons button :global(svg) {
        height: 16px;
        width: 16px;
    }

    .clear-button {
        color: var(--medium-red);
    }

    #processing-list {
        display: flex;
        flex-direction: column;

        max-height: 65vh;
        overflow-y: scroll;
    }

    @media screen and (max-width: 535px) {
        #processing-queue {
            --holder-padding: 8px;
            padding-top: 4px;
            top: env(safe-area-inset-top);
        }
    }
</style>
