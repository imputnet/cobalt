import { readable, type Updater } from "svelte/store";

import type { CobaltWorkerProgress } from "$lib/types/workers";
import type { CobaltCurrentTasks, CobaltCurrentTaskItem } from "$lib/types/queen-bee";

let update: (_: Updater<CobaltCurrentTasks>) => void;

const currentTasks = readable<CobaltCurrentTasks>(
    {},
    (_, _update) => { update = _update }
);

export function addWorkerToQueue(item: CobaltCurrentTaskItem) {
    update(tasks => {
        tasks[item.id] = item;
        return tasks;
    });
}

export function removeWorkerFromQueue(id: string) {
    update(tasks => {
        delete tasks[id];
        return tasks;
    });
}

export function updateWorkerProgress(id: string, progress: CobaltWorkerProgress) {
    update(tasks => {
        tasks[id].progress = progress;
        return tasks;
    });
}

export function clearQueue() {
    update(() => {
        return {};
    });
}

export { currentTasks };
