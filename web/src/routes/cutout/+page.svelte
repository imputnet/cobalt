<script lang="ts">
    import settings from "$lib/state/settings";
    import RemoveBgWorker from "$lib/workers/removebg?worker";

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { downloadFile } from "$lib/download";

    import Skeleton from "$components/misc/Skeleton.svelte";
    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";

    let draggedOver = false;
    let files: FileList | undefined;
    let imageContainer: HTMLElement;
    let canvas: HTMLCanvasElement;

    let state: "empty" | "busy" | "done" = "empty";

    let worker: Worker;

    const renderImageToCanvas = (result: ImageBitmap) => {
        if (canvas && result) {
            canvas.width = result.width;
            canvas.height = result.height;
            canvas
                .getContext("bitmaprenderer")
                ?.transferFromImageBitmap(result);
        }
    };

    const processImage = async () => {
        if (!files) return;

        state = "busy";
        worker = new RemoveBgWorker();

        worker.postMessage({
            cobaltRemoveBgWorker: { file: files[0] },
        });

        worker.onmessage = async (event) => {
            console.log("event received by removebg page:", event);
            const eventData = event.data.cobaltRemoveBgWorker;
            if (eventData.result) {
                state = "done";
                renderImageToCanvas(eventData.result);
            }
        };

        worker.onerror = (e) => {
            state = "empty";
            console.error("bg removal worker exploded:", e);
            worker.terminate();
        };
    };

    const exportImage = async () => {
        if (!files) return;

        const resultBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject();
            }, "image/png");
        });

        return await downloadFile({
            file: new File([resultBlob], `${files[0].name} (cutout).png`, {
                type: "image/png",
            }),
        });
    };

    onMount(() => {
        if (!($settings.advanced.localProcessing && $settings.advanced.debug)) {
            goto("/", { replaceState: true });
        }
    });
</script>

<DropReceiver bind:files bind:draggedOver id="cutout-container">
    {#if state === "empty"}
        <FileReceiver
            bind:draggedOver
            bind:files
            acceptTypes={["image/*"]}
            acceptExtensions={["jpg", "png", "webp"]}
        />
        {#if files}
            <div class="button-row">
                <button on:click={processImage}>process files</button>
                <button
                    on:click={() => {
                        files = undefined;
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
        <div id="image-preview" bind:this={imageContainer} class={state}>
            {#if state === "busy"}
                <Skeleton width="100%" height="100%" class="big" />
            {/if}
            <canvas bind:this={canvas}></canvas>
        </div>
    {/if}

    {#if state === "busy"}
        <div class="button-row">
            <button
                on:click={() => {
                    worker?.terminate();
                    files = undefined;
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
                    state = "empty";
                    files = undefined;
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

    #image-preview canvas {
        display: none;
    }

    #image-preview.done canvas {
        display: block;
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
