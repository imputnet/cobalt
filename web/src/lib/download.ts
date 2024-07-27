import { get } from "svelte/store";

import { app, device } from "$lib/device";
import settings from "$lib/state/settings";

import { createDialog } from "$lib/dialogs";

export const openURL = (url: string) => {
    return window.open(url, "_blank");
}

export const shareURL = async (url: string) => {
    try {
        return await navigator?.share({ url });
    } catch {
        return false;
    }
}

export const copyURL = async (url: string) => {
    try {
        return await navigator?.clipboard.writeText(url);
    } catch {
        return false;
    }
}

export const downloadFile = (url: string) => {
    const savingPreference = get(settings).save.downloadPopup;
    if (savingPreference) {
        createDialog({
            type: "saving",
            id: "saving",
            url
        })
    } else if (device.is.iOS && app.is.installed) {
        return shareURL(url);
    } else {
        return openURL(url);
    }
}
