import RemuxWorker from "$lib/workers/remux?worker";
import FetchWorker from "$lib/workers/fetch?worker";

import { itemDone, itemError, queue } from "$lib/state/queen-bee/queue";
import { updateWorkerProgress } from "$lib/state/queen-bee/current-tasks";

import type { CobaltQueue } from "$lib/types/queue";
import type { CobaltPipelineItem } from "$lib/types/workers";

const killWorker = (worker: Worker, unsubscribe: () => void, interval?: NodeJS.Timeout) => {
    unsubscribe();
    worker.terminate();
    if (interval) clearInterval(interval);
}

export const runRemuxWorker = async (workerId: string, parentId: string, file: File) => {
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
            file
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
            return itemDone(
                parentId,
                workerId,
                new File([eventData.render], eventData.filename, {
                    type: eventData.render.type,
                })
            );
        }

        if (eventData.error) {
            killWorker(worker, unsubscribe, startCheck);
            return itemError(parentId, workerId, eventData.error);
        }
    };
}

export const runFetchWorker = async (workerId: string, parentId: string, url: string) => {
    const worker = new FetchWorker();

    const unsubscribe = queue.subscribe((queue: CobaltQueue) => {
        if (!queue[parentId]) {
            // TODO: remove logging
            console.log("worker's parent is gone, so it killed itself");
            killWorker(worker, unsubscribe);
        }
    });

    worker.postMessage({
        cobaltFetchWorker: {
            url
        }
    });

    worker.onmessage = (event) => {
        const eventData = event.data.cobaltFetchWorker;
        if (!eventData) return;

        if (eventData.progress) {
            updateWorkerProgress(workerId, {
                percentage: eventData.progress,
                size: eventData.size,
            })
        }

        if (eventData.file) {
            killWorker(worker, unsubscribe);
            return itemDone(
                parentId,
                workerId,
                eventData.file,
            );
        }

        if (eventData.error) {
            killWorker(worker, unsubscribe);
            return itemError(parentId, workerId, eventData.error);
        }
    }
}

export const startWorker = async ({ worker, workerId, parentId, workerArgs }: CobaltPipelineItem) => {
    switch (worker) {
        case "remux":
            if (workerArgs?.files) {
                await runRemuxWorker(workerId, parentId, workerArgs.files[0]);
            }
            break;
        case "fetch":
            if (workerArgs?.url) {
                await runFetchWorker(workerId, parentId, workerArgs.url)
            }
            break;
    }
}
