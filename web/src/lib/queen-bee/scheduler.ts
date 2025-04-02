import { get } from "svelte/store";
import { startWorker } from "$lib/queen-bee/run-worker";
import { addWorkerToQueue, currentTasks } from "$lib/state/queen-bee/current-tasks";
import { itemDone, itemError, itemRunning, queue } from "$lib/state/queen-bee/queue";

import type { CobaltPipelineItem } from "$lib/types/workers";

const startPipeline = (pipelineItem: CobaltPipelineItem) => {
    addWorkerToQueue(pipelineItem.workerId, {
        type: pipelineItem.worker,
        parentId: pipelineItem.parentId,
    });

    itemRunning(
        pipelineItem.parentId,
        pipelineItem.workerId,
    );

    startWorker(pipelineItem);
}

export const schedule = () => {
    const queueItems = get(queue);
    const ongoingTasks = get(currentTasks);

    // TODO (?): task concurrency
    if (Object.keys(ongoingTasks).length > 0) {
        return;
    }

    for (const task of Object.values(queueItems)) {
        if (task.state === "running") {
            // if the running worker isn't completed, wait
            // to be called again on worker completion
            if (!task.completedWorkers.has(task.runningWorker)) {
                break;
            }

            // if all workers are completed, then return the
            // the final file and go to the next task
            if (task.completedWorkers.size === task.pipeline.length) {
                const finalFile = task.pipelineResults.pop();

                if (finalFile) {
                    itemDone(task.id, finalFile);
                } else {
                    itemError(task.id, task.runningWorker, "no final file");
                }

                continue;
            }

            // if current worker is completed, but there are more workers,
            // then start the next one and wait to be called again
            for (const worker of task.pipeline) {
                if (!task.completedWorkers.has(worker.workerId)) {
                    startPipeline(worker);
                    break;
                }
            }

            // break because we don't want to start next tasks before this one is done
            // it's necessary because some tasks might take some time before being marked as running
            break;
        }

        // start the nearest waiting task and wait to be called again
        else if (task.state === "waiting" && task.pipeline.length > 0) {
            startPipeline(task.pipeline[0]);

            // break because we don't want to start next tasks before this one is done
            // it's necessary because some tasks might take some time before being marked as running
            break;
        }
    }
}
