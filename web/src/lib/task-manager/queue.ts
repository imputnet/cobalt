import { get } from "svelte/store";
import { t } from "$lib/i18n/translations";
import { ffmpegMetadataArgs } from "$lib/util";
import { createDialog } from "$lib/state/dialogs";
import { addItem } from "$lib/state/task-manager/queue";
import { openQueuePopover } from "$lib/state/queue-visibility";

import type { CobaltQueueItem } from "$lib/types/queue";
import type { CobaltCurrentTasks } from "$lib/types/task-manager";
import type { CobaltPipelineItem, CobaltPipelineResultFileType } from "$lib/types/workers";
import type { CobaltLocalProcessingResponse, CobaltSaveRequestBody } from "$lib/types/api";

export const getMediaType = (type: string) => {
    const kind = type.split('/')[0];

    // can't use .includes() here for some reason
    if (kind === "video" || kind === "audio" || kind === "image") {
        return kind;
    }
}

export const createRemuxPipeline = (file: File) => {
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

const mediaIcons: { [key: string]: CobaltPipelineResultFileType } = {
    merge: "video",
    mute: "video",
    audio: "audio",
    gif: "image",
    remux: "video"
}

const makeRemuxArgs = (info: CobaltLocalProcessingResponse) => {
    const ffargs = ["-c:v", "copy"];

    if (["merge", "remux"].includes(info.type)) {
        ffargs.push("-c:a", "copy");
    } else if (info.type === "mute") {
        ffargs.push("-an");
    }

    ffargs.push(
        ...(info.output.metadata ? ffmpegMetadataArgs(info.output.metadata) : [])
    );

    return ffargs;
}

const makeAudioArgs = (info: CobaltLocalProcessingResponse) => {
    if (!info.audio) {
        return;
    }

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
    return ffargs;
}

const makeGifArgs = () => {
    return [
        "-vf",
        "scale=-1:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "-loop", "0",
        "-f", "gif"
    ];
}

const showError = (errorCode: string) => {
    return createDialog({
        id: "pipeline-error",
        type: "small",
        meowbalt: "error",
        buttons: [
            {
                text: get(t)("button.gotit"),
                main: true,
                action: () => {},
            },
        ],
        bodyText: get(t)(`error.${errorCode}`),
    });
}

export const createSavePipeline = (
    info: CobaltLocalProcessingResponse,
    request: CobaltSaveRequestBody,
    oldTaskId?: string
) => {
    // this is a pre-queue part of processing,
    // so errors have to be returned via a regular dialog

    if (!info.output?.filename || !info.output?.type) {
        return showError("pipeline.missing_response_data");
    }

    const parentId = oldTaskId || crypto.randomUUID();
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

    let ffargs: string[];
    let workerType: 'encode' | 'remux';

    if (["merge", "mute", "remux"].includes(info.type)) {
        workerType = "remux";
        ffargs = makeRemuxArgs(info);
    } else if (info.type === "audio") {
        const args = makeAudioArgs(info);

        if (!args) {
            return showError("pipeline.missing_response_data");
        }

        workerType = "encode";
        ffargs = args;
    } else if (info.type === "gif") {
        workerType = "encode";
        ffargs = makeGifArgs();
    } else {
        console.error("unknown work type: " + info.type);
        return showError("pipeline.missing_response_data");
    }

    pipeline.push({
        worker: workerType,
        workerId: crypto.randomUUID(),
        parentId,
        dependsOn: pipeline.map(w => w.workerId),
        workerArgs: {
            files: [],
            ffargs,
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
        mediaType: mediaIcons[info.type],
    });

    openQueuePopover();
}

export const getProgress = (item: CobaltQueueItem, currentTasks: CobaltCurrentTasks): number => {
    if (item.state === 'done' || item.state === 'error') {
        return 1;
    } else if (item.state === 'waiting') {
        return 0;
    }

    let sum = 0;
    for (const worker of item.pipeline) {
        if (item.pipelineResults[worker.workerId]) {
            sum += 1;
        } else {
            const task = currentTasks[worker.workerId];
            sum += (task?.progress?.percentage || 0) / 100;
        }
    }

    return sum / item.pipeline.length;
}
