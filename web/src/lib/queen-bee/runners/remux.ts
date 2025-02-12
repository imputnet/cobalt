import RemuxWorker from "$lib/workers/remux?worker";

import { killWorker } from "$lib/queen-bee/run-worker";
import { updateWorkerProgress } from "$lib/state/queen-bee/current-tasks";
import { pipelineTaskDone, itemError, queue } from "$lib/state/queen-bee/queue";

import type { FileInfo } from "$lib/types/libav";
import type { CobaltQueue } from "$lib/types/queue";
import type { CobaltFileReference } from "$lib/types/storage";

export const runRemuxWorker = async (
    workerId: string,
    parentId: string,
    files: CobaltFileReference[],
    args: string[],
    output: FileInfo
) => {
    const worker = new RemuxWorker();

    // sometimes chrome refuses to start libav wasm,
    // so we check the health and kill self if it doesn't spawn

    let bumpAttempts = 0;
    const startCheck = setInterval(() => {
        bumpAttempts++;

        if (bumpAttempts === 8) {
            killWorker(worker, unsubscribe, startCheck);
            console.error("worker didn't start after 4 seconds, so it was killed");

            // TODO: proper error code
            return itemError(parentId, workerId, "worker didn't start");
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
        cobaltRemuxWorker: {
            files,
            args,
            output,
        }
    });

    worker.onerror = (e) => {
        console.error("remux worker exploded:", e);
        killWorker(worker, unsubscribe, startCheck);

        // TODO: proper error code
        return itemError(parentId, workerId, "internal error");
    };

    let totalDuration: number | null = null;

    worker.onmessage = (event) => {
        const eventData = event.data.cobaltRemuxWorker;
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
