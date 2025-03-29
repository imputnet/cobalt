import { readable, type Updater } from "svelte/store";

import { checkTasks } from "$lib/queen-bee/scheduler";
import { clearFileStorage, removeFromFileStorage } from "$lib/storage";
import { clearCurrentTasks, removeWorkerFromQueue } from "$lib/state/queen-bee/current-tasks";

import type { CobaltFileReference } from "$lib/types/storage";
import type { CobaltQueue, CobaltQueueItem, CobaltQueueItemRunning } from "$lib/types/queue";

const clearPipelineCache = (queueItem: CobaltQueueItem) => {
    if (queueItem.state === "running" && queueItem.pipelineResults) {
        for (const item of queueItem.pipelineResults) {
            removeFromFileStorage(item.file.name);
        }
        delete queueItem.pipelineResults;
    }
    if (queueItem.state === "done") {
        removeFromFileStorage(queueItem.resultFile.file.name);
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

    checkTasks();
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
    checkTasks();
}

export function itemDone(id: string, file: CobaltFileReference) {
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

    checkTasks();
}

export function pipelineTaskDone(id: string, workerId: string, file: CobaltFileReference) {
    update(queueData => {
        const item = queueData[id];

        if (item && item.state === 'running') {
            item.pipelineResults.push(file);
            item.completedWorkers.add(workerId);
        }

        return queueData;
    });

    removeWorkerFromQueue(workerId);
    checkTasks();
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

    checkTasks();
}

export function removeItem(id: string) {
    update(queueData => {
        if (queueData[id].pipeline) {
            for (const worker in queueData[id].pipeline) {
                removeWorkerFromQueue(queueData[id].pipeline[worker].workerId);
            }
            clearPipelineCache(queueData[id]);
        }

        delete queueData[id];
        return queueData;
    });

    checkTasks();
}

export function clearQueue() {
    update(() => ({}));
    clearCurrentTasks();
    clearFileStorage();
}
