import type { CobaltWorkerProgress } from "$lib/types/workers";

export type CobaltCurrentTaskItem = {
    id: string,
    parentId: string, // parent id is queue id to which this pipeline worker belongs to
    step: number,
    totalSteps: number,
    progress?: CobaltWorkerProgress,
}

export type CobaltCurrentTasks = {
    [id: string]: CobaltCurrentTaskItem,
}
