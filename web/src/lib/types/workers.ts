import type { FileInfo } from "$lib/types/libav";
import type { CobaltFileReference } from "$lib/types/storage";

export const resultFileTypes = ["video", "audio", "image"] as const;

export type CobaltPipelineResultFileType = typeof resultFileTypes[number];

export type CobaltWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
}

type CobaltFFmpegWorkerArgs = {
    files: CobaltFileReference[],
    ffargs: string[],
    output: FileInfo,
}

type CobaltPipelineItemBase = {
    workerId: string,
    parentId: string,
};

type CobaltRemuxPipelineItem = CobaltPipelineItemBase & {
    worker: "remux",
    workerArgs: CobaltFFmpegWorkerArgs,
}

type CobaltEncodePipelineItem = CobaltPipelineItemBase & {
    worker: "encode",
    workerArgs: CobaltFFmpegWorkerArgs,
}

type CobaltFetchPipelineItem = CobaltPipelineItemBase & {
    worker: "fetch",
    workerArgs: { url: string },
}

export type CobaltPipelineItem = CobaltEncodePipelineItem
                               | CobaltRemuxPipelineItem
                               | CobaltFetchPipelineItem;
