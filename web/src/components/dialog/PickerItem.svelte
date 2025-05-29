<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { downloadFile } from "$lib/download";
    import type { DialogPickerItem } from "$lib/types/dialog";

    import Skeleton from "$components/misc/Skeleton.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconPhoto from "@tabler/icons-svelte/IconPhoto.svelte";
    import IconGif from "@tabler/icons-svelte/IconGif.svelte";

    type Props = {
        item: DialogPickerItem;
        number: number;
    };

    const { item, number }: Props = $props();

    const itemType = $derived(item.type ?? "photo");

    let imageLoaded = $state(false);
    let hideSkeleton = $state(false);

    let validUrl = false;
    try {
        new URL(item.url);
        validUrl = true;
    } catch {}

    const isTunnel = validUrl && new URL(item.url).pathname === "/tunnel";

    const loaded = () => {
        imageLoaded = true;

        // remove the skeleton after the image is done fading in
        setTimeout(() => {
            hideSkeleton = true;
        }, 200)
    }
</script>

<button
    class="picker-item"
    onclick={() => {
        if (validUrl) {
            downloadFile({
                url: item.url,
                urlType: isTunnel ? "tunnel" : "redirect",
            });
        }
    }}
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
        onload={loaded}
        alt="{$t(`a11y.dialog.picker.item.${itemType}`)} {number}"
    />
    <Skeleton class="picker-image elevated" hidden={hideSkeleton} />
</button>

<style>
    .picker-item {
        position: relative;
        background: none;
        padding: 0;
        box-shadow: none;
        border-radius: calc(var(--border-radius) / 2 + 2px);
    }

    .picker-item:focus-visible::after {
        content: "";
        width: 100%;
        height: 100%;
        position: absolute;
        outline: var(--focus-ring);
        outline-offset: var(--focus-ring-offset);
        border-radius: inherit;
    }

    :global(.picker-image) {
        width: 100%;
        height: 100%;

        aspect-ratio: 1/1;
        pointer-events: all;

        object-fit: cover;
        border-radius: inherit;

        position: absolute;
        z-index: 2;

        opacity: 1;
        transition: opacity 0.2s;
    }

    :global(.skeleton.picker-image) {
        z-index: 1;
        position: relative;
    }

    .picker-image.loading {
        opacity: 0;
    }

    .picker-image.video-thumbnail {
        pointer-events: none;
    }

    :global(.picker-item:active .picker-image) {
        opacity: 0.75;
    }

    @media (hover: hover) {
        :global(.picker-item:hover:not(:active) .picker-image) {
            opacity: 0.8;
        }
    }

    .picker-type {
        position: absolute;
        color: var(--white);
        background: rgba(0, 0, 0, 0.5);
        width: 24px;
        height: 24px;
        z-index: 3;

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
