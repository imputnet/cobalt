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

export type CobaltFetchWorkerArgs = { url: string };

export type CobaltRemuxWorkerArgs = {
    files: CobaltFileReference[],
    ffargs: string[],
    output: FileInfo,
}

export type CobaltPipelineItemBase = {
    worker: CobaltWorkerType,
    workerId: string,
    parentId: string,
};

type CobaltRemuxPipelineItem = CobaltPipelineItemBase & {
    worker: "remux",
    workerArgs: CobaltRemuxWorkerArgs,
}

type CobaltFetchPipelineItem = CobaltPipelineItemBase & {
    worker: "fetch",
    workerArgs: CobaltFetchWorkerArgs,
}

export type CobaltPipelineItem = CobaltRemuxPipelineItem | CobaltFetchPipelineItem;
