<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { downloadFile } from "$lib/download";
    import type { DialogPickerItem } from "$lib/types/dialog";

    import Skeleton from "$components/misc/Skeleton.svelte";

    export let item: DialogPickerItem;

    let imageLoaded = false;
</script>

<button
    class="picker-item"
    on:click={() => {
        downloadFile(item.url);
    }}
>
    <img
        class="picker-image"
        src={item.thumb ? item.thumb : item.url}
        class:loading={!imageLoaded}
        on:load={() => (imageLoaded = true)}
        alt={$t("a11y.dialog.picker.item.generic")}
        height="100"
        width="100"
    />
    <Skeleton class="picker-image" hidden={imageLoaded} />
</button>

<style>
    .picker-item {
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

    .picker-item:active .picker-image {
        opacity: 0.8;
    }

    @media (hover: hover) {
        .picker-item:hover .picker-image {
            opacity: 0.8;
        }
    }
</style>
