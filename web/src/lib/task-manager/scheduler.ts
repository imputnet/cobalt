import { get } from "svelte/store";
import { startWorker } from "$lib/task-manager/run-worker";
import { addWorkerToQueue, currentTasks } from "$lib/state/task-manager/current-tasks";
import { itemDone, itemError, itemRunning, queue } from "$lib/state/task-manager/queue";

import type { CobaltPipelineItem } from "$lib/types/workers";

const startPipeline = (pipelineItem: CobaltPipelineItem) => {
    addWorkerToQueue(pipelineItem.workerId, {
        type: pipelineItem.worker,
        parentId: pipelineItem.parentId,
    });

    itemRunning(pipelineItem.parentId);
    startWorker(pipelineItem);
}

// this is really messy, sorry to whoever
// reads this in the future (probably myself)
export const schedule = () => {
    const queueItems = get(queue);
    const ongoingTasks = get(currentTasks);

    for (const task of Object.values(queueItems)) {
        if (task.state === "running") {
            const finalWorker = task.pipeline[task.pipeline.length - 1];

            // if all workers are completed, then return the
            // the final file and go to the next task
            if (Object.keys(task.pipelineResults).length === task.pipeline.length) {
                // remove the final file from pipeline results, so that it doesn't
                // get deleted when we clean up the intermediate files
                const finalFile = task.pipelineResults[finalWorker.workerId];
                delete task.pipelineResults[finalWorker.workerId];

                if (finalFile) {
                    itemDone(task.id, finalFile);
                } else {
                    itemError(task.id, finalWorker.workerId, "queue.no_final_file");
                }

                continue;
            }

            // if current worker is completed, but there are more workers,
            // then start the next one and wait to be called again
            for (const worker of task.pipeline) {
                if (task.pipelineResults[worker.workerId] || ongoingTasks[worker.workerId]) {
                    continue;
                }

                const needsToWait = worker.dependsOn?.some(id => !task.pipelineResults[id]);
                if (needsToWait) {
                    break;
                }

                startPipeline(worker);
            }

            // break because we don't want to start next tasks before this one is done
            // it's necessary because some tasks might take some time before being marked as running
            break;
        }

        // start the nearest waiting task and wait to be called again
        else if (task.state === "waiting" && task.pipeline.length > 0 && Object.keys(ongoingTasks).length === 0) {
            // this is really bad but idk how to prevent tasks from running simultaneously
            // on retry if a later task is running & user restarts an old task
            for (const task of Object.values(queueItems)) {
                if (task.state === "running") return;
            }

            startPipeline(task.pipeline[0]);

            // break because we don't want to start next tasks before this one is done
            // it's necessary because some tasks might take some time before being marked as running
            break;
        }
    }
}
