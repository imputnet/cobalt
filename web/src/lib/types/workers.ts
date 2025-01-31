import type { FileInfo } from "$lib/types/libav";

export const resultFileTypes = ["video", "audio", "image"] as const;

export type CobaltWorkerType = "remux" | "fetch";
export type CobaltPipelineResultFileType = typeof resultFileTypes[number];

export type CobaltWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
}

export type CobaltWorkerArgs = {
    files?: File[],
    url?: string,
    ffargs?: string[],
    output?: FileInfo,
    filename?: string,
}

export type CobaltPipelineItem = {
    worker: CobaltWorkerType,
    workerId: string,
    parentId: string,
    workerArgs: CobaltWorkerArgs,
}
