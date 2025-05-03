import type { CobaltSaveRequestBody } from "$lib/types/api";
import type { CobaltPipelineItem, CobaltPipelineResultFileType } from "$lib/types/workers";

export type CobaltQueueItemState = "waiting" | "running" | "done" | "error";

export type CobaltQueueBaseItem = {
    id: string,
    state: CobaltQueueItemState,
    pipeline: CobaltPipelineItem[],
    canRetry?: boolean,
    originalRequest?: CobaltSaveRequestBody,
    // TODO: metadata
    filename: string,
    mimeType?: string,
    mediaType: CobaltPipelineResultFileType,
};

export type CobaltQueueItemWaiting = CobaltQueueBaseItem & {
    state: "waiting",
};

export type CobaltQueueItemRunning = CobaltQueueBaseItem & {
    state: "running",
    runningWorker: string,
    completedWorkers: Set<string>,
    pipelineResults: File[],
};

export type CobaltQueueItemDone = CobaltQueueBaseItem & {
    state: "done",
    resultFile: File,
};

export type CobaltQueueItemError = CobaltQueueBaseItem & {
    state: "error",
    errorCode: string,
};

export type CobaltQueueItem = CobaltQueueItemWaiting | CobaltQueueItemRunning | CobaltQueueItemDone | CobaltQueueItemError;

export type CobaltQueue = {
    [id: string]: CobaltQueueItem,
};
