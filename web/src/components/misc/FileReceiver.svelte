<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import IconFileUpload from "@tabler/icons-svelte/IconFileUpload.svelte";

    export let file: File;
    export let draggedOver = false;
    export let acceptTypes: string[];
    export let acceptExtensions: string[];

    const openFile = async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = acceptTypes.join(",");

        fileInput.click();

        fileInput.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;

            if (target.files?.length === 1) {
                file = target.files[0];
                return file;
            }
        };
    };
</script>

<div class="open-file-container" class:dragged-over={draggedOver}>
    <Meowbalt emotion="question" />

    <button class="open-file-button" on:click={() => openFile()}>
        <div class="open-file-icon">
            <IconFileUpload />
        </div>

        <div class="open-file-text">
            <div class="open-title">
                {#if draggedOver}
                    {$t("receiver.title.drop")}
                {:else}
                    {$t("receiver.title")}
                {/if}
            </div>
            <div class="subtext accept-list">
                {$t("receiver.accept", {
                    formats: acceptExtensions.join(", ")
                })}
            </div>
        </div>
    </button>
</div>

<style>
    .open-file-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .open-file-button {
        flex-direction: column;
        padding: 36px;
        border-radius: 24px;
        box-shadow: none;
        background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='24' ry='24' stroke='%236E6E6E60' stroke-width='5' stroke-dasharray='10%2c20' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");

        transition: box-shadow 0.2s;
    }

    .open-file-container :global(.meowbalt) {
        clip-path: inset(0px 0px 16px 0px);
        margin-bottom: -16px;

        transition: clip-path 0.2s, margin-bottom 0.2s;
    }

    .dragged-over .open-file-button {
        box-shadow:
            0 0 0 2px var(--button-hover-transparent) inset,
            0 0 50px 10px var(--button-hover);
    }

    .dragged-over :global(.meowbalt) {
        clip-path: inset(0px 0px 9px 0px);
        margin-bottom: -9px;
    }

    .open-file-icon {
        display: flex;
    }

    .open-file-icon :global(svg) {
        width: 52px;
        height: 52px;
        stroke-width: 1.5px;
    }

    .open-file-text {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .open-title {
        font-size: 18px;
    }

    .accept-list {
        max-width: 250px;
        font-size: 14px;
    }
</style>
