import { get } from "svelte/store";
import { itemRunning, queue } from "$lib/state/queen-bee/queue";
import { startWorker } from "$lib/queen-bee/run-worker";
import { addWorkerToQueue, currentTasks } from "$lib/state/queen-bee/current-tasks";

export const checkTasks = () => {
    const queueItems = get(queue);
    const ongoingTasks = get(currentTasks)

    if (Object.keys(ongoingTasks).length > 0) return;

    for (const item of Object.keys(queueItems)) {
        const task = queueItems[item];

        if (task.state === "running") {
            break;
        }

        if (task.state === "waiting") {
            for (let i = 0; i < task.pipeline.length; i++) {
                // TODO: loop here and pass the file between pipelines
                // or schedule several tasks one after another but within
                // one parent & pipeline
                const pipelineItem = task.pipeline[i];

                startWorker(pipelineItem);

                addWorkerToQueue({
                    id: pipelineItem.workerId,
                    parentId: task.id,
                    step: i + 1,
                    totalSteps: task.pipeline.length,
                });

                itemRunning(task.id, i);
                break;
            }
            break;
        }
    }
}
