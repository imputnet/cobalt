import { addItem } from "$lib/state/queen-bee/queue";
import type { CobaltPipelineItem } from "$lib/types/workers";
import type { CobaltLocalProcessingResponse } from "$lib/types/api";

export const getMediaType = (type: string) => {
    const kind = type.split('/')[0];

    // can't use .includes() here for some reason
    if (kind === "video" || kind === "audio" || kind === "image") {
        return kind;
    }
}

export const createRemuxPipeline = (file: File) => {
    // chopped khia
    const parentId = crypto.randomUUID();
    const mediaType = getMediaType(file.type);

    const pipeline: CobaltPipelineItem[] = [{
        worker: "remux",
        workerId: crypto.randomUUID(),
        parentId,
        workerArgs: {
            files: [file],
            ffargs: [
                "-c", "copy",
                "-map", "0"
            ],
            output: {
                type: file.type,
                extension: file.name.split(".").pop(),
            },
            filename: file.name,
        },
    }];

    if (mediaType) {
        addItem({
            id: parentId,
            state: "waiting",
            pipeline,
            filename: file.name,
            mediaType,
        })
    }
}

export const createSavePipeline = (info: CobaltLocalProcessingResponse) => {
    const parentId = crypto.randomUUID();
    const pipeline: CobaltPipelineItem[] = [];

    for (const tunnel of info.tunnel) {
        pipeline.push({
            worker: "fetch",
            workerId: crypto.randomUUID(),
            parentId,
            workerArgs: {
                url: tunnel,
            },
        })
    }

    addItem({
        id: parentId,
        state: "waiting",
        pipeline,
        filename: info.filename,
        mediaType: "video",
    })
}
