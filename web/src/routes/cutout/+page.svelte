<script lang="ts">
    import settings from "$lib/state/settings";
    import RemoveBgWorker from '$lib/workers/removebg?worker';

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import { downloadFile } from "$lib/download";
    import { maskImage } from "$lib/workers/removebg";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";
    import Skeleton from "$components/misc/Skeleton.svelte";

    let draggedOver = false;
    let file: File | undefined;
    let result: HTMLCanvasElement;
    let imageContainer: HTMLElement;

    let state: "empty" | "busy" | "done" = "empty";

    let worker: Worker;

    const processImage = async () => {
        if (!file) return;

        state = "busy";

        worker = new RemoveBgWorker();

        worker.postMessage({ file });
        worker.onmessage = async (event) => {
            const maskedCanvas = await maskImage(event.data.source, event.data.mask);

            if (!maskedCanvas) {
                state = "empty";
                return;
            };

            state = "done";

            result = maskedCanvas;
            imageContainer.append(maskedCanvas);

            worker.terminate();
        };

        worker.onerror = (e) => {
            console.error("bg removal worker exploded:", e)
            worker.terminate();
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
    {#if state === "empty"}
        <FileReceiver
            bind:draggedOver
            bind:file
            acceptTypes={["image/*"]}
            acceptExtensions={["jpg", "png", "webp"]}
        />
        {#if file}
            <div class="button-row">
                <button on:click={processImage}>process files</button>
                <button
                    on:click={() => {
                        file = undefined;
                    }}
                >
                    clear imported files
                </button>
            </div>
        {/if}
        <div class="subtext early-note">
            this is a very early & basic proof-of-concept, nothing about this feature is final or complete. please don't share or talk about it.
        </div>
    {/if}

    {#if state === "busy"}
        <div>thinking very hard rn...</div>
    {/if}

    {#if state === "done"}
        <div>thought a lot, here's what i got:</div>
    {/if}

    {#if ["busy", "done"].includes(state)}
        <div id="image-preview" bind:this={imageContainer}>
            {#if state === "busy"}
                <Skeleton width="100%" height="100%" class="big" />
            {/if}
        </div>
    {/if}

    {#if state === "busy"}
        <div class="button-row">
            <button
                on:click={() => {
                    worker?.terminate();
                    file = undefined;
                    state = "empty";
                }}
            >
                cancel
            </button>
        </div>
    {/if}

    {#if state === "done"}
        <div class="button-row">
            <button
                on:click={() => {
                    state = "empty"
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

    .button-row {
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
