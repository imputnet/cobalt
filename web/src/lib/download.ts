import { get } from "svelte/store";

import settings from "$lib/state/settings";

import { device } from "$lib/device";
import { t } from "$lib/i18n/translations";

import { createDialog } from "$lib/dialogs";
import type { DialogInfo } from "$lib/types/dialog";

const openSavingDialog = ({ url, file, body }: { url?: string, file?: File, body?: string }) => {
    const dialogData: DialogInfo = {
        type: "saving",
        id: "saving",
        file,
        url,
    }
    if (body) dialogData.bodyText = body;

    createDialog(dialogData)
}

export const openFile = (file: File) => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
}

export const shareFile = async (file: File) => {
    return await navigator?.share({
        files: [
            new File([file], file.name, {
                type: file.type,
            }),
        ],
    });
}

export const openURL = (url: string) => {
    const open = window.open(url, "_blank");

    /* if new tab got blocked by user agent, show a saving dialog */
    if (!open) {
        return openSavingDialog({
            url,
            body: get(t)("dialog.saving.blocked")
        });
    }
}

export const shareURL = async (url: string) => {
    return await navigator?.share({ url });
}

export const copyURL = async (url: string) => {
    return await navigator?.clipboard?.writeText(url);
}

export const downloadFile = ({ url, file }: { url?: string, file?: File }) => {
    if (!url && !file) throw new Error("attempted to download void");

    const pref = get(settings).save.savingMethod;

    if (pref === "ask") {
        return openSavingDialog({ url, file });
    }

    /*
        user actions (such as invoke share, open new tab) have expiration.
        in webkit, for example, that timeout is 5 seconds.
        https://github.com/WebKit/WebKit/blob/b838f8bb/Source/WebCore/page/LocalDOMWindow.cpp#L167

        navigator.userActivation.isActive makes sure that we're still able to
        invoke an action without the user agent interrupting it.
        if not, we show a saving dialog for user to re-invoke that action.
    */
    if (!navigator.userActivation.isActive) {
        return openSavingDialog({
            url,
            file,
            body: get(t)("dialog.saving.timeout"),
        });
    }

    try {
        if (file) {
            if (pref === "share" && device.supports.share) {
                return shareFile(file);
            } else if (pref === "download" && device.supports.directDownload) {
                return openFile(file);
            }
        }

        if (url) {
            if (pref === "share" && device.supports.share) {
                return shareURL(url);
            } else if (pref === "download" && device.supports.directDownload) {
                return openURL(url);
            } else if (pref === "copy" && !file) {
                return copyURL(url);
            }
        }
    } catch { /* catch & ignore */ }

    return openSavingDialog({ url, file });
}
