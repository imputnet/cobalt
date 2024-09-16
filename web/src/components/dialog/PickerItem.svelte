<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { downloadFile } from "$lib/download";
    import type { DialogPickerItem } from "$lib/types/dialog";

    import Skeleton from "$components/misc/Skeleton.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import IconGif from "@tabler/icons-svelte/IconGif.svelte";

    export let item: DialogPickerItem;
    export let number: number;

    let imageLoaded = false;

    $: itemType = item.type ?? "photo";
</script>

<button
    class="picker-item"
    on:click={() =>
        downloadFile({
            url: item.url,
        })}
>
    <div class="picker-type">
        {#if itemType === "video"}
            <IconMovie />
        {:else if itemType === "gif"}
            <IconGif />
        {:else}
            <IconPhoto />
        {/if}
    </div>

    <img
        class="picker-image"
        src={item.thumb ?? item.url}
        class:loading={!imageLoaded}
        class:video-thumbnail={["video", "gif"].includes(itemType)}
        on:load={() => (imageLoaded = true)}
        alt="{$t(`a11y.dialog.picker.item.${itemType}`)} {number}"
    />
    <Skeleton class="picker-image elevated" hidden={imageLoaded} />
</button>

<style>
    .picker-item {
        position: relative;
        background: none;
        padding: 2px;
        box-shadow: none;
        border-radius: calc(var(--border-radius) / 2 + 2px);
    }

    :global(.picker-image) {
        display: block;
        width: 100%;
        height: 100%;

        aspect-ratio: 1/1;
        pointer-events: all;

        object-fit: cover;
        border-radius: calc(var(--border-radius) / 2);
    }

    .picker-image.loading {
        display: none;
    }

    .picker-image.video-thumbnail {
        pointer-events: none;
    }

    :global(.picker-item:active .picker-image) {
        opacity: 0.7;
    }

    @media (hover: hover) {
        :global(.picker-item:hover .picker-image) {
            opacity: 0.7;
        }
    }

    .picker-type {
        position: absolute;
        color: var(--white);
        background: rgba(0, 0, 0, 0.5);
        width: 24px;
        height: 24px;
        z-index: 9;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        top: 6px;
        left: 6px;

        border-radius: 6px;

        pointer-events: none;
    }

    .picker-type :global(svg) {
        width: 22px;
        height: 22px;
    }
</style>
