import type { CobaltPipelineItem, CobaltWorkerProgress } from "$lib/types/workers";

export type CobaltCurrentTaskItem = {
    type: CobaltPipelineItem['worker'],
    parentId: string,
    progress?: CobaltWorkerProgress,
}

export type CobaltCurrentTasks = {
    [id: string]: CobaltCurrentTaskItem,
}
