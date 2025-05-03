import { readable, type Updater } from "svelte/store";

import { schedule } from "$lib/task-manager/scheduler";
import { clearFileStorage, removeFromFileStorage } from "$lib/storage/opfs";
import { clearCurrentTasks, removeWorkerFromQueue } from "$lib/state/task-manager/current-tasks";

import type { CobaltQueue, CobaltQueueItem, CobaltQueueItemRunning } from "$lib/types/queue";

const clearPipelineCache = (queueItem: CobaltQueueItem) => {
    if (queueItem.state === "running") {
        let item: File | undefined;
        while ((item = queueItem.pipelineResults.pop())) {
            removeFromFileStorage(item.name);
        }
    } else if (queueItem.state === "done") {
        removeFromFileStorage(queueItem.resultFile.name);
    }

    return queueItem;
}

let update: (_: Updater<CobaltQueue>) => void;

export const queue = readable<CobaltQueue>(
    {},
    (_, _update) => { update = _update }
);

export function addItem(item: CobaltQueueItem) {
    update(queueData => {
        queueData[item.id] = item;
        return queueData;
    });

    schedule();
}

export function itemError(id: string, workerId: string, error: string) {
    update(queueData => {
        if (queueData[id]) {
            queueData[id] = clearPipelineCache(queueData[id]);

            queueData[id] = {
                ...queueData[id],
                state: "error",
                errorCode: error,
            }
        }
        return queueData;
    });

    removeWorkerFromQueue(workerId);
    schedule();
}

export function itemDone(id: string, file: File) {
    update(queueData => {
        if (queueData[id]) {
            queueData[id] = clearPipelineCache(queueData[id]);

            queueData[id] = {
                ...queueData[id],
                state: "done",
                resultFile: file,
            }
        }
        return queueData;
    });

    schedule();
}

export function pipelineTaskDone(id: string, workerId: string, file: File) {
    update(queueData => {
        const item = queueData[id];

        if (item && item.state === 'running') {
            item.pipelineResults.push(file);
            item.completedWorkers.add(workerId);
        }

        return queueData;
    });

    removeWorkerFromQueue(workerId);
    schedule();
}

export function itemRunning(id: string, workerId: string) {
    update(queueData => {
        const data = queueData[id] as CobaltQueueItemRunning;

        if (data) {
            data.state = 'running';
            data.runningWorker = workerId;
            data.completedWorkers ??= new Set();
            data.pipelineResults ??= [];
        }

        return queueData;
    });

    schedule();
}

export function removeItem(id: string) {
    update(queueData => {
        const item = queueData[id];

        for (const worker of item.pipeline) {
            removeWorkerFromQueue(worker.workerId);
        }
        clearPipelineCache(item);

        delete queueData[id];
        return queueData;
    });

    schedule();
}

export function clearQueue() {
    update(() => ({}));
    clearCurrentTasks();
    clearFileStorage();
}
