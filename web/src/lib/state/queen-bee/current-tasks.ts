import { readable, type Updater } from "svelte/store";

import type { CobaltWorkerProgress } from "$lib/types/workers";
import type { CobaltCurrentTasks, CobaltCurrentTaskItem } from "$lib/types/queen-bee";

let update: (_: Updater<CobaltCurrentTasks>) => void;

const currentTasks = readable<CobaltCurrentTasks>(
    {},
    (_, _update) => { update = _update }
);

export function addWorkerToQueue(workerId: string, item: CobaltCurrentTaskItem) {
    update(tasks => {
        tasks[workerId] = item;
        return tasks;
    });
}

export function removeWorkerFromQueue(id: string) {
    update(tasks => {
        delete tasks[id];
        return tasks;
    });
}

export function updateWorkerProgress(workerId: string, progress: CobaltWorkerProgress) {
    update(allTasks => {
        allTasks[workerId].progress = progress;
        return allTasks;
    });
}

export function clearQueue() {
    update(() => {
        return {};
    });
}

export { currentTasks };
