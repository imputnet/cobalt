import { readonly, writable } from "svelte/store";

import type { CobaltWorkerProgress } from "$lib/types/workers";
import type { CobaltCurrentTasks, CobaltCurrentTaskItem } from "$lib/types/task-manager";

const currentTasks_ = writable<CobaltCurrentTasks>({});
export const currentTasks = readonly(currentTasks_);

export function addWorkerToQueue(workerId: string, item: CobaltCurrentTaskItem) {
    currentTasks_.update(tasks => {
        tasks[workerId] = item;
        return tasks;
    });
}

export function removeWorkerFromQueue(id: string) {
    currentTasks_.update(tasks => {
        delete tasks[id];
        return tasks;
    });
}

export function updateWorkerProgress(workerId: string, progress: CobaltWorkerProgress) {
    currentTasks_.update(allTasks => {
        allTasks[workerId].progress = progress;
        return allTasks;
    });
}

export function clearCurrentTasks() {
    currentTasks_.set({});
}
