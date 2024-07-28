import { get } from "svelte/store";

import { app, device } from "$lib/device";
import settings from "$lib/state/settings";

import { createDialog } from "$lib/dialogs";

export const openSavingDialog = (url: string) =>
    createDialog({
        type: "saving",
        id: "saving",
        url
    })

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

    /*
        user actions (such as invoke share, open new tab) have expiration.
        in webkit, for example, that timeout is 5 seconds.
        https://github.com/WebKit/WebKit/blob/b838f8bb3573bd5906bc5f02fcc8cb274b3c9b8a/Source/WebCore/page/LocalDOMWindow.cpp#L167

        navigator.userActivation.isActive makes sure that we're still able to
        invoke an action without the user agent interrupting it.
        if not, we show a saving dialog for user to re-invoke that action.
    */
    if (savingPreference || !navigator.userActivation.isActive) {
        openSavingDialog(url);
    } else if (device.is.iOS && app.is.installed) {
        return shareURL(url);
    } else {
        return openURL(url);
    }
}
