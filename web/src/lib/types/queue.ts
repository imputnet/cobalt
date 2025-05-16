import type { CobaltSaveRequestBody } from "$lib/types/api";
import type { CobaltPipelineItem, CobaltPipelineResultFileType } from "$lib/types/workers";

type CobaltQueueBaseItem = {
    id: string,
    pipeline: CobaltPipelineItem[],
    canRetry?: boolean,
    originalRequest?: CobaltSaveRequestBody,
    filename: string,
    mimeType?: string,
    mediaType: CobaltPipelineResultFileType,
};

type CobaltQueueItemWaiting = CobaltQueueBaseItem & {
    state: "waiting",
};

export type CobaltQueueItemRunning = CobaltQueueBaseItem & {
    state: "running",
    completedWorkers: Set<string>,
    pipelineResults: File[],
};

type CobaltQueueItemDone = CobaltQueueBaseItem & {
    state: "done",
    resultFile: File,
};

type CobaltQueueItemError = CobaltQueueBaseItem & {
    state: "error",
    errorCode: string,
};

export type CobaltQueueItem = CobaltQueueItemWaiting
                            | CobaltQueueItemRunning
                            | CobaltQueueItemDone
                            | CobaltQueueItemError;

export type CobaltQueue = {
    [id: string]: CobaltQueueItem,
};
