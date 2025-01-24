export const resultFileTypes = ["video", "audio", "image"] as const;

export type CobaltWorkerType = "remux" | "removebg";
export type CobaltPipelineResultFileType = typeof resultFileTypes[number];

export type CobaltWorkerProgress = {
    percentage?: number,
    speed?: number,
    size: number,
}

export type CobaltWorkerArgs = {
    files: File[],
    //TODO: args for libav & etc with unique types
}

export type CobaltPipelineItem = {
    worker: CobaltWorkerType,
    workerId: string,
    parentId: string,
    workerArgs: CobaltWorkerArgs,
}
