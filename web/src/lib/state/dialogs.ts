import { readable, type Updater } from "svelte/store";
import type { DialogInfo } from "$lib/types/dialog";

let update: (_: Updater<DialogInfo[]>) => void;
let nextId = 0;

export default readable<DialogInfo[]>(
    [],
    (_, _update) => { update = _update }
);

export function createDialog(newData: DialogInfo) {
    update((popups) => {
        popups.push({ ...newData, id: `${newData.id}-${nextId++}` });
        return popups;
    });
}

export function killDialog(id?: string) {
    update((popups) => {
        const index = id ? popups.findIndex(popup => popup.id === id) : popups.length - 1;
        if (index >= 0) popups.splice(index, 1);
        return popups;
    });
}
