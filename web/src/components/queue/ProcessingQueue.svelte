<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "$lib/i18n/translations";
    import { beforeNavigate, onNavigate } from "$app/navigation";

    import { clearFileStorage } from "$lib/storage/opfs";

    import { getProgress } from "$lib/task-manager/queue";
    import { queueVisible } from "$lib/state/queue-visibility";
    import { currentTasks } from "$lib/state/task-manager/current-tasks";
    import { clearQueue, queue as readableQueue } from "$lib/state/task-manager/queue";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import PopoverContainer from "$components/misc/PopoverContainer.svelte";
    import ProcessingStatus from "$components/queue/ProcessingStatus.svelte";
    import ProcessingQueueItem from "$components/queue/ProcessingQueueItem.svelte";
    import ProcessingQueueStub from "$components/queue/ProcessingQueueStub.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";

    const popoverAction = () => {
        $queueVisible = !$queueVisible;
    };

    let queue = $derived(Object.entries($readableQueue));

    let totalProgress = $derived(queue.length ? queue.map(
        ([, item]) => getProgress(item, $currentTasks) * 100
    ).reduce((a, b) => a + b) / (100 * queue.length) : 0);

    let indeterminate = $derived(queue.length > 0 && totalProgress === 0);

    onNavigate(() => {
        $queueVisible = false;
    });

    onMount(() => {
        // clear old files from storage on first page load
        clearFileStorage();
    });

    beforeNavigate((event) => {
        if (event.type === "leave" && (totalProgress > 0 && totalProgress < 1)) {
            event.cancel();
        }
    });
</script>

<div id="processing-queue">
    <ProcessingStatus
        progress={totalProgress * 100}
        {indeterminate}
        expandAction={popoverAction}
    />

    <PopoverContainer
        id="processing-popover"
        expanded={$queueVisible}
        expandStart="right"
    >
        <div id="processing-header">
            <div class="header-top">
                <SectionHeading
                    title={$t("queue.title")}
                    sectionId="queue"
                    beta
                    nolink
                />
                <div class="header-buttons">
                    {#if queue.length}
                        <button
                            class="clear-button"
                            onclick={clearQueue}
                            tabindex={!$queueVisible ? -1 : undefined}
                        >
                            <IconX />
                            {$t("button.clear")}
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <div id="processing-list" role="list" aria-labelledby="queue-title">
            {#each queue as [id, item]}
                <ProcessingQueueItem {id} info={item} />
            {/each}
            {#if queue.length === 0}
                <ProcessingQueueStub />
            {/if}
        </div>
    </PopoverContainer>
</div>

<style>
    #processing-queue {
        --holder-padding: 12px;
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
        flex-direction: column;
        flex-wrap: wrap;
        gap: 3px;
    }

    .header-top {
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
        outline-offset: 5px;
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
