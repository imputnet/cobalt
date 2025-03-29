import { get } from "svelte/store";
import { queue } from "$lib/state/queen-bee/queue";

import { runRemuxWorker } from "$lib/queen-bee/runners/remux";
import { runFetchWorker } from "$lib/queen-bee/runners/fetch";

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
            if (workerArgs?.files) {
                files = workerArgs.files;
            }

            if (files?.length === 0) {
                const parent = get(queue)[parentId];
                if (parent.state === "running" && parent.pipelineResults.length) {
                    files = parent.pipelineResults;
                }
            }

            if (files.length > 0 && workerArgs.ffargs && workerArgs.output) {
                await runRemuxWorker(
                    workerId,
                    parentId,
                    files,
                    workerArgs.ffargs,
                    workerArgs.output,
                    /*resetStartCounter=*/true,
                );
            }
            break;

        case "fetch":
            if (workerArgs?.url) {
                await runFetchWorker(workerId, parentId, workerArgs.url)
            }
            break;
    }
}
