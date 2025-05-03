import FFmpegWorker from "$lib/task-manager/workers/ffmpeg?worker";

import { killWorker } from "$lib/task-manager/run-worker";
import { updateWorkerProgress } from "$lib/state/task-manager/current-tasks";
import { pipelineTaskDone, itemError, queue } from "$lib/state/task-manager/queue";

import type { FileInfo } from "$lib/types/libav";
import type { CobaltQueue } from "$lib/types/queue";

let startAttempts = 0;

export const runFFmpegWorker = async (
    workerId: string,
    parentId: string,
    files: File[],
    args: string[],
    output: FileInfo,
    variant: 'remux' | 'encode',
    resetStartCounter = false
) => {
    const worker = new FFmpegWorker();

    // sometimes chrome refuses to start libav wasm,
    // so we check if it started, try 10 more times if not, and kill self if it still doesn't work
    // TODO: fix the underlying issue because this is ridiculous

    if (resetStartCounter) startAttempts = 0;

    let bumpAttempts = 0;
    const startCheck = setInterval(async () => {
        bumpAttempts++;

        if (bumpAttempts === 10) {
            startAttempts++;
            if (startAttempts <= 10) {
                killWorker(worker, unsubscribe, startCheck);
                console.error("worker didn't start after 5 seconds, so it was killed and started again");
                return await runFFmpegWorker(workerId, parentId, files, args, output, variant);
            } else {
                killWorker(worker, unsubscribe, startCheck);
                console.error("worker didn't start after 10 attempts, so we're giving up");

                // TODO: proper error code
                return itemError(parentId, workerId, "worker didn't start");
            }
        }
    }, 500);

    const unsubscribe = queue.subscribe((queue: CobaltQueue) => {
        if (!queue[parentId]) {
            // TODO: remove logging
            console.log("worker's parent is gone, so it killed itself");
            killWorker(worker, unsubscribe, startCheck);
        }
    });

    worker.postMessage({
        cobaltFFmpegWorker: {
            variant,
            files,
            args,
            output,
        }
    });

    worker.onerror = (e) => {
        console.error("ffmpeg worker exploded:", e);
        killWorker(worker, unsubscribe, startCheck);

        // TODO: proper error code
        return itemError(parentId, workerId, "internal error");
    };

    let totalDuration: number | null = null;

    worker.onmessage = (event) => {
        const eventData = event.data.cobaltFFmpegWorker;
        if (!eventData) return;

        clearInterval(startCheck);

        // temporary debug logging
        console.log(JSON.stringify(eventData, null, 2));

        if (eventData.progress) {
            if (eventData.progress.duration) {
                totalDuration = eventData.progress.duration;
            }

            updateWorkerProgress(workerId, {
                percentage: totalDuration ? (eventData.progress.durationProcessed / totalDuration) * 100 : 0,
                size: eventData.progress.size,
            })
        }

        if (eventData.render) {
            killWorker(worker, unsubscribe, startCheck);
            return pipelineTaskDone(
                parentId,
                workerId,
                eventData.render,
            );
        }

        if (eventData.error) {
            killWorker(worker, unsubscribe, startCheck);
            return itemError(parentId, workerId, eventData.error);
        }
    };
}
