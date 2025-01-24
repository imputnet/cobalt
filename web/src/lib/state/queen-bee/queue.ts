import { readable, type Updater } from "svelte/store";
import type { CobaltQueue, CobaltQueueItem } from "$lib/types/queue";
import { checkTasks } from "$lib/queen-bee/scheduler";
import { removeWorkerFromQueue } from "./current-tasks";

let update: (_: Updater<CobaltQueue>) => void;

const queue = readable<CobaltQueue>(
    {},
    (_, _update) => { update = _update }
);

export function addItem(item: CobaltQueueItem) {
    update(queueData => {
        queueData[item.id] = item;
        return queueData;
    });

    checkTasks();
}

export function itemError(id: string, workerId: string, error: string) {
    update(queueData => {
        if (queueData[id]) {
            queueData[id] = {
                ...queueData[id],
                state: "error",
                errorCode: error,
            }
        }
        return queueData;
    });

    removeWorkerFromQueue(workerId);
    checkTasks();
}

export function itemDone(id: string, workerId: string, file: File) {
    update(queueData => {
        if (queueData[id]) {
            queueData[id] = {
                ...queueData[id],
                state: "done",
                resultFile: file,
            }
        }
        return queueData;
    });

    removeWorkerFromQueue(workerId);
    checkTasks();
}

export function itemRunning(id: string, workerId: string) {
    update(queueData => {
        if (queueData[id]) {
            queueData[id] = {
                ...queueData[id],
                state: "running",
                runningWorker: workerId,
            }
        }
        return queueData;
    });

    checkTasks();
}

export function removeItem(id: string) {
    update(queueData => {
        for (const worker in queueData[id].pipeline) {
            removeWorkerFromQueue(queueData[id].pipeline[worker].workerId);
        }

        delete queueData[id];
        return queueData;
    });

    checkTasks();
}

export function clearQueue() {
    update(() => {
        return {};
    });
}

export { queue };
