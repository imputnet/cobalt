import type { CobaltWorkerProgress } from "$lib/types/workers";

export type CobaltCurrentTaskItem = {
    parentId: string,
    progress?: CobaltWorkerProgress,
}

export type CobaltCurrentTasks = {
    [id: string]: CobaltCurrentTaskItem,
}
