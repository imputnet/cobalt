import { get } from "svelte/store";
import { queue } from "$lib/state/task-manager/queue";

import { runFFmpegWorker } from "$lib/task-manager/runners/ffmpeg";
import { runFetchWorker } from "$lib/task-manager/runners/fetch";

import type { CobaltPipelineItem } from "$lib/types/workers";
import type { CobaltFileReference } from "$lib/types/storage";

export const killWorker = (worker: Worker, unsubscribe: () => void, interval?: NodeJS.Timeout) => {
    unsubscribe();
    worker.terminate();
    if (interval) clearInterval(interval);
}

export const startWorker = async ({ worker, workerId, parentId, workerArgs }: CobaltPipelineItem) => {
    let files: CobaltFileReference[] = [];

    switch (worker) {
        case "remux":
        case "encode":
            if (workerArgs.files) {
                files = workerArgs.files;
            }

            if (files.length === 0) {
                const parent = get(queue)[parentId];
                if (parent.state === "running" && parent.pipelineResults.length) {
                    files = parent.pipelineResults;
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
            }
            break;

        case "fetch":
            await runFetchWorker(workerId, parentId, workerArgs.url)
            break;
    }
}
