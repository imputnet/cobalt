import type { FileInfo } from "$lib/types/libav";
import type { CobaltFileReference } from "$lib/types/storage";

export const resultFileTypes = ["video", "audio", "image"] as const;

export type CobaltWorkerType = "remux" | "fetch";
export type CobaltPipelineResultFileType = typeof resultFileTypes[number];

export type CobaltWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
}

export type CobaltWorkerArgs = {
    files?: CobaltFileReference[],
    url?: string,
    ffargs?: string[],
    output?: FileInfo,
}

export type CobaltPipelineItem = {
    worker: CobaltWorkerType,
    workerId: string,
    parentId: string,
    workerArgs: CobaltWorkerArgs,
}
