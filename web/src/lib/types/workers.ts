import type { FileInfo } from "$lib/types/libav";
import type { UUID } from "./queue";

export const resultFileTypes = ["video", "audio", "image", "file"] as const;

export type CobaltPipelineResultFileType = typeof resultFileTypes[number];

export type CobaltWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
};

type CobaltFFmpegWorkerArgs = {
    files: File[],
    ffargs: string[],
    output: FileInfo,
};

type CobaltPipelineItemBase = {
    workerId: UUID,
    parentId: UUID,
    dependsOn?: UUID[],
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
