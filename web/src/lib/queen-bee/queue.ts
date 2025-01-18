import { addItem } from "$lib/state/queen-bee/queue";
import type { CobaltPipelineItem } from "$lib/types/workers";

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
