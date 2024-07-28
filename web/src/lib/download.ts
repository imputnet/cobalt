import { get } from "svelte/store";

import { device } from "$lib/device";
import settings from "$lib/state/settings";

import { createDialog } from "$lib/dialogs";

export const openSavingDialog = (url: string) =>
    createDialog({
        type: "saving",
        id: "saving",
        url
    })

export const openURL = (url: string) => {
    const open = window.open(url, "_blank");

    /* if new tab got blocked by user agent, show a saving dialog */
    if (!open) {
        return openSavingDialog(url);
    }
}

export const shareURL = async (url: string) => {
    return await navigator?.share({ url });
}

export const copyURL = async (url: string) => {
    return await navigator?.clipboard?.writeText(url);
}

export const downloadFile = (url: string) => {
    const pref = get(settings).save.savingMethod;

    /*
        user actions (such as invoke share, open new tab) have expiration.
        in webkit, for example, that timeout is 5 seconds.
        https://github.com/WebKit/WebKit/blob/b838f8bb3573bd5906bc5f02fcc8cb274b3c9b8a/Source/WebCore/page/LocalDOMWindow.cpp#L167

        navigator.userActivation.isActive makes sure that we're still able to
        invoke an action without the user agent interrupting it.
        if not, we show a saving dialog for user to re-invoke that action.
    */

    if (pref === "ask" || !navigator.userActivation.isActive) {
        return openSavingDialog(url);
    }

    try {
        if (pref === "share" && device.supports.share) {
            return shareURL(url);
        } else if (pref === "download" && device.supports.directDownload) {
            return openURL(url);
        } else if (pref === "copy") {
            return copyURL(url);
        }
    } catch {}

    return openSavingDialog(url);
}
