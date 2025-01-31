import { get } from "svelte/store";
import { startWorker } from "$lib/queen-bee/run-worker";
import { itemDone, itemError, itemRunning, queue } from "$lib/state/queen-bee/queue";
import { addWorkerToQueue, currentTasks } from "$lib/state/queen-bee/current-tasks";
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

export const checkTasks = () => {
    const queueItems = get(queue);
    const ongoingTasks = get(currentTasks);

    // TODO (?): task concurrency
    if (Object.keys(ongoingTasks).length > 0) return;

    for (const item of Object.keys(queueItems)) {
        const task = queueItems[item];

        if (task.state === "running") {
            // if the running worker isn't completed and wait to be called again
            // (on worker completion)
            if (!task.completedWorkers?.includes(task.runningWorker)) {
                break;
            }

            // if all workers are completed, then return the final file and go to next task
            if (task.completedWorkers.length === task.pipeline.length) {
                const finalFile = task.pipelineResults?.pop();
                if (finalFile) {
                    itemDone(task.id, finalFile);
                    continue;
                } else {
                    itemError(task.id, task.runningWorker, "no final file");
                    continue;
                }
            }

            // if current worker is completed, but there are more workers,
            // then start the next one and wait to be called again
            for (let i = 0; i < task.pipeline.length; i++) {
                if (!task.completedWorkers.includes(task.pipeline[i].workerId)) {
                    startPipeline(task.pipeline[i]);
                    break;
                }
            }
        }

        // start the nearest waiting task and wait to be called again
        if (task.state === "waiting" && task.pipeline.length > 0) {
            startPipeline(task.pipeline[0]);
            break;
        }
    }
}
