<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import type { SvelteComponent } from "svelte";
    import type { QueueItem } from "$lib/types/queue";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import DownloadStatus from "$components/downloads/DownloadStatus.svelte";
    import PopoverContainer from "$components/misc/PopoverContainer.svelte";
    import DownloadItem from "$components/downloads/DownloadItem.svelte";

    import IconX from "@tabler/icons-svelte/IconX.svelte";

    import IconGif from "@tabler/icons-svelte/IconGif.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconVolume3 from "@tabler/icons-svelte/IconVolume3.svelte";
    let popover: SvelteComponent;
    $: expanded = false;

    $: progress = 0;
    $: indeterminate = false;

    const itemIcons = {
        video: IconMovie,
        audio: IconMusic,
        mute: IconVolume3,
        image: IconPhoto,
        gif: IconGif,
    };

    // dummy data for testing ui rn
    const downloadQueue: QueueItem[] = [
        {
            id: "fake id",
            type: "video",
            filename: "placeholder.mp4",
            status: "processing: 69%",
            progress: 69,
        },
        {
            id: "fake id",
            type: "audio",
            filename: "placeholder.mp3",
            status: "processing: 3%",
            progress: 3,
        },
        {
            id: "fake id",
            type: "mute",
            filename: "placeholder.mp4",
            status: "processing: 55%",
            progress: 55,
        },
        {
            id: "fake id",
            type: "image",
            filename: "placeholder.jpg",
            status: "processing: 21%",
            progress: 22,
        },
        {
            id: "fake id",
            type: "gif",
            filename: "placeholder.gif",
            status: "processing: 82%",
            progress: 82,
        },
    ];

    const popoverAction = async () => {
        expanded = !expanded;
        if (expanded) {
            popover.focus();
        }
    };

    onNavigate(() => {
        expanded = false;
    });
</script>

<div id="downloads-manager">
    <DownloadStatus
        {indeterminate}
        {progress}
        expandAction={popover?.showPopover}
    />

    <PopoverContainer
        bind:this={popover}
        id="downloads-popover"
        {expanded}
        {popoverAction}
        expandStart="right"
    >
        <div id="downloads-header">
            <div class="downloads-header-title">downloads</div>
            {#if downloadQueue.length > 0}
                <button class="downloads-clear-button">
                    <IconX />
                    clear
                </button>
            {/if}
        </div>
        <div id="downloads-list">
            {#each downloadQueue as item}
                <DownloadItem
                    filename={item.filename}
                    status={item.status}
                    progress={item.progress}
                    icon={itemIcons[item.type]}
                />
            {/each}
            {#if downloadQueue.length === 0}
                <div class="list-stub">
                    <Meowbalt emotion="think" />
                    <span>your downloads will appear here!</span>
                </div>
            {/if}
        </div>
    </PopoverContainer>
</div>

<style>
    #downloads-manager {
        position: absolute;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: end;
        z-index: 9;
        pointer-events: none;
        padding: 16px;
    }

    #downloads-manager :global(#downloads-popover) {
        padding: 16px;
        max-width: 425px;
        gap: 12px;
    }

    #downloads-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .downloads-header-title {
        font-size: 15px;
        font-weight: 500;
    }

    .downloads-clear-button {
        font-size: 13px;
        font-weight: 500;
        color: var(--red);

        padding: 0;
        background: none;
        box-shadow: none;
    }

    .downloads-clear-button :global(svg) {
        height: 16px;
        width: 16px;
    }

    #downloads-list {
        display: flex;
        flex-direction: column;

        max-height: 60vh;
        overflow: scroll;
    }

    .list-stub {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 25px;
        text-align: center;
        gap: var(--padding);
    }

    .list-stub :global(.meowbalt) {
        height: 120px;
    }

    @media screen and (max-width: 535px) {
        #downloads-manager {
            top: calc(env(safe-area-inset-top) - var(--padding) + 4px);
        }
    }
</style>
