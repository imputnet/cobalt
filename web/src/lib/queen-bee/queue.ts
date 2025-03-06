import mime from "mime";

import { addItem } from "$lib/state/queen-bee/queue";
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
        })
    }
}

export const createSavePipeline = (info: CobaltLocalProcessingResponse, request: CobaltSaveRequestBody) => {
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
        })
    }

    pipeline.push({
        worker: "remux",
        workerId: crypto.randomUUID(),
        parentId,
        workerArgs: {
            ffargs: [
                "-c:v", "copy",
                "-c:a", "copy"
            ],
            output: {
                // TODO: return mime type from api to avoid dragging a big ass package into web build
                type: mime.getType(info.filename) || undefined,
                format: info.filename.split(".").pop(),
            },
        },
    })

    addItem({
        id: parentId,
        state: "waiting",
        pipeline,
        canRetry: true,
        originalRequest: request,
        filename: info.filename,
        mimeType: mime.getType(info.filename) || undefined,
        mediaType: "video",
    })
}
