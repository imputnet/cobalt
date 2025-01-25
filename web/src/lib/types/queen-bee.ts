import type { CobaltWorkerProgress, CobaltWorkerType } from "$lib/types/workers";

export type CobaltCurrentTaskItem = {
    type: CobaltWorkerType,
    parentId: string,
    progress?: CobaltWorkerProgress,
}

export type CobaltCurrentTasks = {
    [id: string]: CobaltCurrentTaskItem,
}
