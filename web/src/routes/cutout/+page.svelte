<script lang="ts">
    import settings from "$lib/state/settings";

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import { downloadFile } from "$lib/download";
    import { removeImageBackground } from "$lib/workers/removebg";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";
    import Skeleton from "$components/misc/Skeleton.svelte";

    let imageContainer: HTMLElement;

    let draggedOver = false;
    let file: File | undefined;

    let thinking = false;
    let done = false;

    let result: HTMLCanvasElement;

    const processImage = async () => {
        if (file) {
            thinking = true;
            const removedBackground = await removeImageBackground(file);
            if (removedBackground) {
                thinking = false;
                done = true;
                result = removedBackground;
                imageContainer.append(removedBackground);
            }
        }
    };

    const exportImage = async () => {
        result.toBlob(async (blob) => {
            if (!blob || !file) return;
            return await downloadFile({
                file: new File([blob], `${file.name} (cutout).png`, {
                    type: "image/png",
                }),
            });
        }, "image/png");
    };

    onMount(() => {
        if (!($settings.advanced.duck && $settings.advanced.debug)) {
            goto("/", { replaceState: true });
        }
    });
</script>

<DropReceiver bind:file bind:draggedOver id="cutout-container">
    {#if !thinking && !done}
        <FileReceiver
            bind:draggedOver
            bind:file
            acceptTypes={["image/*"]}
            acceptExtensions={["jpg", "png", "webp"]}
        />
        <div class="subtext early-note">
            this is a very early & basic proof-of-concept, nothing about this feature is final or complete. please don't share or talk about it.
        </div>
        {#if file}
            <button on:click={processImage}>process imported stuff</button>
        {/if}
    {/if}

    {#if thinking}
        <div>thinking very hard rn...</div>
    {/if}

    {#if done}
        <div>thought a lot, here's what i got:</div>
    {/if}

    {#if thinking || done}
        <div id="image-preview" bind:this={imageContainer}>
            {#if !done}
                <Skeleton width="100%" height="100%" class="big" />
            {/if}
        </div>
    {/if}

    {#if done}
        <div id="finished-actions">
            <button
                on:click={() => {
                    done = false;
                    file = undefined;
                }}
            >
                start over
            </button>
            <button on:click={exportImage}>save the result</button>
        </div>
    {/if}
</DropReceiver>

<style>
    :global(#cutout-container) {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        gap: 18px;
    }

    .early-note {
        max-width: 400px;
        text-align: center;
    }

    #image-preview {
        background: var(--button);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 720px;
        height: 480px;
        overflow: hidden;
        border-radius: var(--border-radius);
        box-shadow: var(--button-box-shadow);
    }

    #finished-actions {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    button {
        padding: 12px 24px;
        border-radius: 200px;
    }

    :global(canvas) {
        height: 100%;
    }
</style>
