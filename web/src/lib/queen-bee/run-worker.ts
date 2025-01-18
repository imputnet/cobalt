import RemuxWorker from "$lib/workers/remux?worker";
//import RemoveBgWorker from "$lib/workers/removebg?worker";

import type { CobaltPipelineItem } from "$lib/types/workers";
import { itemDone, itemError } from "$lib/state/queen-bee/queue";

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

    worker.onmessage = (event) => {
        const eventData = event.data.cobaltRemuxWorker;
        if (!eventData) return;

        console.log(eventData);

        // TODO: calculate & use progress again

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
