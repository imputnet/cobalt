import { get, writable } from "svelte/store";

export const queueVisible = writable(false);

export const showQueuePopover = () => {
    const visible = get(queueVisible);
    if (!visible) {
        return queueVisible.update(v => !v);
    }
}
