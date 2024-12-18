import { merge } from "ts-deepmerge";
import { get, readable, type Updater } from "svelte/store";
import type { OngoingQueueItem, QueueItem } from "$lib/types/queue";

type Queue = {
    [id: string]: QueueItem;
}

type OngoingQueue = {
    [id: string]: OngoingQueueItem;
}

let update: (_: Updater<Queue>) => void;

const queue = readable<Queue>(
    {},
    (_, _update) => { update = _update }
);

export function addToQueue(item: QueueItem) {
    update(queueData => {
        queueData[item.id] = item;
        return queueData;
    });
}

export function removeFromQueue(id: string) {
    update(queueData => {
        delete queueData[id];
        return queueData;
    });
}

let updateOngoing: (_: Updater<OngoingQueue>) => void;

const ongoingQueue = readable<OngoingQueue>(
    {},
    (_, _update) => { updateOngoing = _update }
);

export function updateOngoingQueue(id: string, itemInfo: Partial<OngoingQueueItem> = {}) {
    updateOngoing(queueData => {
        if (get(queue)?.id) {
            queueData[id] = merge(queueData[id], {
                id,
                ...itemInfo,
            });
        }

        return queueData;
    });
}

export function removeFromOngoingQueue(id: string) {
    updateOngoing(queue => {
        delete queue[id];
        return queue;
    });
}

export { queue, ongoingQueue };
