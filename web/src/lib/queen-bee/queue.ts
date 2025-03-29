import { addItem } from "$lib/state/queen-bee/queue";
import { openQueuePopover } from "$lib/state/queue-visibility";
import { ffmpegMetadataArgs } from "$lib/util";

import type { CobaltPipelineItem } from "$lib/types/workers";
import type { CobaltLocalProcessingResponse, CobaltSaveRequestBody } from "$lib/types/api";

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
            files: [{
                file,
                type: file.type,
            }],
            ffargs: [
                "-c", "copy",
                "-map", "0"
            ],
            output: {
                type: file.type,
                format: file.name.split(".").pop(),
            },
        },
    }];

    if (mediaType) {
        addItem({
            id: parentId,
            state: "waiting",
            pipeline,
            filename: file.name,
            mimeType: file.type,
            mediaType,
        });

        openQueuePopover();
    }
}

export const createSavePipeline = (info: CobaltLocalProcessingResponse, request: CobaltSaveRequestBody) => {
    // TODO: proper error here
    if (!(info.output?.filename && info.output?.type)) return;

    const parentId = crypto.randomUUID();
    const pipeline: CobaltPipelineItem[] = [];

    // reverse is needed for audio (second item) to be downloaded first
    const tunnels = info.tunnel.reverse();

    for (const tunnel of tunnels) {
        pipeline.push({
            worker: "fetch",
            workerId: crypto.randomUUID(),
            parentId,
            workerArgs: {
                url: tunnel,
            },
        });
    }

    pipeline.push({
        worker: "remux",
        workerId: crypto.randomUUID(),
        parentId,
        workerArgs: {
            ffargs: [
                "-c:v", "copy",
                "-c:a", "copy",
                ...(info.output.metadata ? ffmpegMetadataArgs(info.output.metadata) : [])
            ],
            output: {
                type: info.output.type,
                format: info.output.filename.split(".").pop(),
            },
        },
    });

    addItem({
        id: parentId,
        state: "waiting",
        pipeline,
        canRetry: true,
        originalRequest: request,
        filename: info.output.filename,
        mimeType: info.output.type,
        mediaType: "video",
    });

    openQueuePopover();
}
