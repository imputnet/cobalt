import type { CobaltPipelineItem, CobaltWorkerProgress } from "$lib/types/workers";
import type { UUID } from "./queue";

export type CobaltCurrentTaskItem = {
    type: CobaltPipelineItem['worker'],
    parentId: UUID,
    progress?: CobaltWorkerProgress,
}

export type CobaltCurrentTasks = {
    [id: UUID]: CobaltCurrentTaskItem,
}
