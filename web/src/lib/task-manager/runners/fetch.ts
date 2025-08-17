import FetchWorker from "$lib/task-manager/workers/fetch?worker";

import { killWorker } from "$lib/task-manager/run-worker";
import { updateWorkerProgress } from "$lib/state/task-manager/current-tasks";
import { pipelineTaskDone, itemError, queue } from "$lib/state/task-manager/queue";

import type { CobaltQueue, UUID } from "$lib/types/queue";

export const runFetchWorker = async (workerId: UUID, parentId: UUID, url: string) => {
    const worker = new FetchWorker();

    const unsubscribe = queue.subscribe((queue: CobaltQueue) => {
        if (!queue[parentId]) {
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

        if (eventData.result) {
            killWorker(worker, unsubscribe);
            return pipelineTaskDone(
                parentId,
                workerId,
                eventData.result,
            );
        }

        if (eventData.error) {
            killWorker(worker, unsubscribe);
            return itemError(parentId, workerId, eventData.error);
        }
    }
}
