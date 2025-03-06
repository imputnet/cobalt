import API from "$lib/api/api";
import settings from "$lib/state/settings";
import lazySettingGetter from "$lib/settings/lazy-get";

import { get } from "svelte/store";
import { t } from "$lib/i18n/translations";
import { downloadFile } from "$lib/download";
import { createDialog } from "$lib/state/dialogs";
import { downloadButtonState } from "$lib/state/omnibox";
import { createSavePipeline } from "$lib/queen-bee/queue";

import type { DialogInfo } from "$lib/types/dialog";
import type { CobaltSaveRequestBody } from "$lib/types/api";

const defaultErrorPopup: DialogInfo = {
    id: "save-error",
    type: "small",
    meowbalt: "error",
};

export const savingHandler = async ({ url, request }: { url?: string, request?: CobaltSaveRequestBody }) => {
    downloadButtonState.set("think");

    const errorButtons = [
        {
            text: get(t)("button.gotit"),
            main: true,
            action: () => { },
        },
    ];

    const getSetting = lazySettingGetter(get(settings));

    if (!request && !url) return;

    const selectedRequest = request || {
        // pointing typescript to the fact that
        // url is either present or not used at all,
        // aka in cases when request is present
        url: url!,

        alwaysProxy: getSetting("save", "alwaysProxy"),
        localProcessing: getSetting("save", "localProcessing"),
        downloadMode: getSetting("save", "downloadMode"),

        filenameStyle: getSetting("save", "filenameStyle"),
        disableMetadata: getSetting("save", "disableMetadata"),

        audioBitrate: getSetting("save", "audioBitrate"),
        audioFormat: getSetting("save", "audioFormat"),
        tiktokFullAudio: getSetting("save", "tiktokFullAudio"),
        youtubeDubLang: getSetting("save", "youtubeDubLang"),

        youtubeVideoCodec: getSetting("save", "youtubeVideoCodec"),
        videoQuality: getSetting("save", "videoQuality"),
        youtubeHLS: getSetting("save", "youtubeHLS"),

        convertGif: getSetting("save", "convertGif"),
        allowH265: getSetting("save", "allowH265"),
    }

    const response = await API.request(selectedRequest);

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
        // TODO: remove debug logging
        console.log(response);

        downloadButtonState.set("done");
        return createSavePipeline(response);
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
