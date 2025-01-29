import API from "$lib/api/api";

import { get } from "svelte/store";
import { t } from "$lib/i18n/translations";
import { downloadFile } from "$lib/download";
import { createDialog } from "$lib/state/dialogs";
import { downloadButtonState } from "$lib/state/omnibox";

import type { DialogInfo } from "$lib/types/dialog";

const defaultErrorPopup: DialogInfo = {
    id: "save-error",
    type: "small",
    meowbalt: "error",
};

export const savingHandler = async (link: string) => {
    downloadButtonState.set("think");

    const errorButtons = [
        {
            text: get(t)("button.gotit"),
            main: true,
            action: () => { },
        },
    ];

    const response = await API.request(link);

    if (!response) {
        downloadButtonState.set("error");

        return createDialog({
            ...defaultErrorPopup,
            buttons: errorButtons,
            bodyText: get(t)("error.api.unreachable"),
        });
    }

    if (response.status === "error") {
        downloadButtonState.set("error");

        return createDialog({
            ...defaultErrorPopup,
            buttons: errorButtons,
            bodyText: get(t)(response.error.code, response?.error?.context),
        });
    }

    if (response.status === "redirect") {
        downloadButtonState.set("done");

        return downloadFile({
            url: response.url,
            urlType: "redirect",
        });
    }

    if (response.status === "tunnel") {
        downloadButtonState.set("check");

        const probeResult = await API.probeCobaltTunnel(response.url);

        if (probeResult === 200) {
            downloadButtonState.set("done");

            return downloadFile({
                url: response.url,
            });
        } else {
            downloadButtonState.set("error");

            return createDialog({
                ...defaultErrorPopup,
                buttons: errorButtons,
                bodyText: get(t)("error.tunnel.probe"),
            });
        }
    }

    if (response.status === "local-processing") {
        // TODO: actual implementation
        console.log(response);
    }

    if (response.status === "picker") {
        downloadButtonState.set("done");
        const buttons = [
            {
                text: get(t)("button.done"),
                main: true,
                action: () => { },
            },
        ];

        if (response.audio) {
            const pickerAudio = response.audio;
            buttons.unshift({
                text: get(t)("button.download.audio"),
                main: false,
                action: () => {
                    downloadFile({
                        url: pickerAudio,
                    });
                },
            });
        }

        return createDialog({
            id: "download-picker",
            type: "picker",
            items: response.picker,
            buttons,
        });
    }

    downloadButtonState.set("error");
    return createDialog({
        ...defaultErrorPopup,
        buttons: errorButtons,
        bodyText: get(t)("error.api.unknown_response"),
    });
}
