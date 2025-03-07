import settings from "$lib/state/settings";
import { get, writable } from "svelte/store";

export const queueVisible = writable(false);

export const openQueuePopover = () => {
    const visible = get(queueVisible);
    if (!visible && !get(settings).accessibility.dontAutoOpenQueue) {
        return queueVisible.update(v => !v);
    }
}
