<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { onNavigate } from "$app/navigation";
    import type { SvelteComponent } from "svelte";

    import PopoverContainer from "$components/misc/PopoverContainer.svelte";
    import ProcessingStatus from "$components/queue/ProcessingStatus.svelte";
    import ProcessingQueueItem from "$components/queue/ProcessingQueueItem.svelte";
    import ProcessingQueueStub from "$components/queue/ProcessingQueueStub.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconPlus from "@tabler/icons-svelte/IconPlus.svelte";

    import IconGif from "@tabler/icons-svelte/IconGif.svelte";
    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import IconVolume3 from "@tabler/icons-svelte/IconVolume3.svelte";

    import settings from "$lib/state/settings";
    import { addToQueue, nukeEntireQueue, queue } from "$lib/state/queue";
    import type { QueueItem } from "$lib/types/queue";

    let popover: SvelteComponent;
    $: expanded = false;

    $: queueItems = Object.entries($queue) as [id: string, item: QueueItem][];

    $: queueLength = Object.keys($queue).length;
    $: indeterminate = false;

    const itemIcons = {
        video: IconMovie,
        video_mute: IconVolume3,
        audio: IconMusic,
        audio_convert: IconMusic,
        image: IconPhoto,
        gif: IconGif,
    };

    const addFakeQueueItem = () => {
        return addToQueue({
            id: crypto.randomUUID(),
            status: "waiting",
            type: "video",
            filename: "test.mp4",
            files: [
                {
                    type: "video",
                    url: "https://",
                },
            ],
            processingSteps: [],
        });
    };

    const popoverAction = async () => {
        expanded = !expanded;
    };

    onNavigate(() => {
        expanded = false;
    });
</script>

<div id="processing-queue" class:expanded>
    <ProcessingStatus {indeterminate} expandAction={popover?.showPopover} />

    <PopoverContainer
        bind:this={popover}
        id="processing-popover"
        {expanded}
        {popoverAction}
        expandStart="right"
    >
        <div id="processing-header">
            <div class="header-title">{$t("queue.title")}</div>
            <div class="header-buttons">
                {#if queueLength > 0}
                    <button class="clear-button" on:click={nukeEntireQueue}>
                        <IconX />
                        {$t("button.clear")}
                    </button>
                {/if}
                <!-- button for ui debug -->
                {#if $settings.advanced.debug}
                    <button class="test-button" on:click={addFakeQueueItem}>
                        <IconPlus />
                        add item
                    </button>
                {/if}
            </div>
        </div>
        <div id="processing-list">
            {#each queueItems as [id, item]}
                <ProcessingQueueItem
                    {id}
                    filename={item.filename}
                    status={item.status}
                    icon={itemIcons[item.type]}
                />
            {/each}
            {#if queueLength === 0}
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
    }

    .header-title {
        font-size: 15px;
        font-weight: 500;
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
        color: var(--red);
    }

    #processing-list {
        display: flex;
        flex-direction: column;

        max-height: 65vh;
        overflow: scroll;
    }

    @media screen and (max-width: 535px) {
        #processing-queue {
            --holder-padding: 8px;
            padding-top: 4px;
            top: env(safe-area-inset-top);
        }
    }
</style>
