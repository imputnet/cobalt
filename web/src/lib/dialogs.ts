import { readable, type Updater } from "svelte/store";
import type { DialogInfo } from "$lib/types/dialog";

let update: (_: Updater<DialogInfo[]>) => void;

export default readable<DialogInfo[]>(
    [],
    (_, _update) => { update = _update }
);

export function createDialog(newData: DialogInfo) {
    update((popups) => {
        popups.push(newData);
        return popups;
    });
}

export function killDialog() {
    update((popups) => {
        popups.pop()
        return popups;
    });
}
