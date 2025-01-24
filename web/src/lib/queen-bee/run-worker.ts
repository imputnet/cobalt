import RemuxWorker from "$lib/workers/remux?worker";

import type { CobaltPipelineItem } from "$lib/types/workers";
import { itemDone, itemError } from "$lib/state/queen-bee/queue";
import { updateWorkerProgress } from "$lib/state/queen-bee/current-tasks";

const workerError = (parentId: string, workerId: string, worker: Worker, error: string) => {
    itemError(parentId, workerId, error);
    worker.terminate();
}

const workerSuccess = (parentId: string, workerId: string, worker: Worker, file: File) => {
    itemDone(parentId, workerId, file);
    worker.terminate();
}

export const runRemuxWorker = async (workerId: string, parentId: string, file: File) => {
    const worker = new RemuxWorker();

    worker.postMessage({ file });

    worker.onerror = (e) => {
        console.error("remux worker exploded:", e);

        // TODO: proper error code
        workerError(parentId, workerId, worker, "internal error");
    };

    // sometimes chrome refuses to start libav wasm,
    // so we check the health and kill self if it doesn't spawn

    let bumpAttempts = 0;
    const startCheck = setInterval(() => {
        bumpAttempts++;

        if (bumpAttempts === 8) {
            worker.terminate();
            console.error("worker didn't start after 4 seconds, so it was killed");

            // TODO: proper error code
            return workerError(parentId, workerId, worker, "worker didn't start");
        }
    }, 500);

    let totalDuration: number | null = null;

    worker.onmessage = (event) => {
        const eventData = event.data.cobaltRemuxWorker;
        if (!eventData) return;

        // temporary debug logging
        console.log(JSON.stringify(eventData, null, 2));

        clearInterval(startCheck);

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
            return workerSuccess(
                parentId,
                workerId,
                worker,
                new File([eventData.render], eventData.filename, {
                    type: eventData.render.type,
                })
            );
        }

        if (eventData.error) {
            return workerError(parentId, workerId, worker, eventData.error);
        }
    };
}

export const startWorker = async ({ worker, workerId, parentId, workerArgs }: CobaltPipelineItem) => {
    switch (worker) {
        case "remux":
            await runRemuxWorker(workerId, parentId, workerArgs.files[0]);
            break;
    }
}
