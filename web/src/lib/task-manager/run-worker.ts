import { get } from "svelte/store";
import { queue, itemError } from "$lib/state/task-manager/queue";

import { runFFmpegWorker } from "$lib/task-manager/runners/ffmpeg";
import { runFetchWorker } from "$lib/task-manager/runners/fetch";

import type { CobaltPipelineItem } from "$lib/types/workers";

export const killWorker = (worker: Worker, unsubscribe: () => void, interval?: NodeJS.Timeout) => {
    unsubscribe();
    worker.terminate();
    if (interval) clearInterval(interval);
}

export const startWorker = async ({ worker, workerId, dependsOn, parentId, workerArgs }: CobaltPipelineItem) => {
    let files: File[] = [];

    switch (worker) {
        case "remux":
        case "encode": {
            if (workerArgs.files) {
                files = workerArgs.files;
            }

            const parent = get(queue)[parentId];
            if (parent?.state === "running" && dependsOn) {
                for (const workerId of dependsOn) {
                    const file = parent.pipelineResults[workerId];
                    if (!file) {
                        return itemError(parentId, workerId, "queue.ffmpeg.no_args");
                    }

                    files.push(file);
                }
            }

            if (files.length > 0 && workerArgs.ffargs && workerArgs.output) {
                await runFFmpegWorker(
                    workerId,
                    parentId,
                    files,
                    workerArgs.ffargs,
                    workerArgs.output,
                    worker,
                    /*resetStartCounter=*/true,
                );
            } else {
                itemError(parentId, workerId, "queue.ffmpeg.no_args");
            }
            break;
        }

        case "fetch":
            await runFetchWorker(workerId, parentId, workerArgs.url);
            break;
    }
}
