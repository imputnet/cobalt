import { get } from "svelte/store";
import { t } from "$lib/i18n/translations";
import { addItem } from "$lib/state/task-manager/queue";
import { createDialog } from "$lib/state/dialogs";
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
    if (!info.output?.filename || !info.output?.type) {
        return;
    }

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

    if (["merge", "mute"].includes(info.type)) {
        const ffargs = ["-c:v", "copy"];

        if (info.type === "merge") {
            ffargs.push("-c:a", "copy");
        } else if (info.type === "mute") {
            ffargs.push("-an");
        }

        ffargs.push(
            ...(info.output.metadata ? ffmpegMetadataArgs(info.output.metadata) : [])
        );

        pipeline.push({
            worker: "remux",
            workerId: crypto.randomUUID(),
            parentId,
            workerArgs: {
                files: [],
                ffargs,
                output: {
                    type: info.output.type,
                    format: info.output.filename.split(".").pop(),
                },
            },
        });
    } else if (info.type === "audio") {
        if (!info.audio) return; // TODO: proper error

        const ffargs = [
            "-vn",
            ...(info.audio.copy ? ["-c:a", "copy"] : ["-b:a", `${info.audio.bitrate}k`]),
            ...(info.output.metadata ? ffmpegMetadataArgs(info.output.metadata) : [])
        ];

        if (info.audio.format === "mp3" && info.audio.bitrate === "8") {
            ffargs.push("-ar", "12000");
        }

        if (info.audio.format === "opus") {
            ffargs.push("-vbr", "off")
        }

        const outFormat = info.audio.format === "m4a" ? "ipod" : info.audio.format;

        ffargs.push('-f', outFormat);

        pipeline.push({
            worker: "encode",
            workerId: crypto.randomUUID(),
            parentId,
            workerArgs: {
                files: [],
                ffargs,
                output: {
                    type: info.output.type,
                    format: info.output.filename.split(".").pop(),
                },
            },
        });
    } else if ("gif" === info.type) {
        return createDialog({
            id: "save-error",
            type: "small",
            meowbalt: "error",
            buttons: [
                {
                    text: get(t)("button.gotit"),
                    main: true,
                    action: () => { },
                },
            ],
            bodyText: "audio and gif processing isn't implemented yet!",
        });
    }

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
