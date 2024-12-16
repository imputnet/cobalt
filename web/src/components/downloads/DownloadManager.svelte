<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import type { SvelteComponent } from "svelte";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import DownloadStatus from "$components/downloads/DownloadStatus.svelte";
    import PopoverContainer from "$components/misc/PopoverContainer.svelte";

    let popover: SvelteComponent;
    $: expanded = false;

    $: progress = 0;
    $: indeterminate = false;

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
        </div>
        <div id="downloads-list">
            <div class="list-stub">
                <Meowbalt emotion="think" />
                <span>your downloads will appear here!</span>
            </div>
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
    }

    #downloads-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .downloads-header-title {
        font-size: 14px;
        font-weight: 500;
    }

    #downloads-list {
        display: flex;
        flex-direction: column;
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
