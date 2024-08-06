import { get } from "svelte/store";

import env, { apiURL } from "$lib/env";
import { t } from "$lib/i18n/translations";
import settings, { updateSetting } from "$lib/state/settings";
import { createDialog } from "$lib/dialogs";

import type { CobaltAPIResponse } from "$lib/types/api";
import type { Optional } from "$lib/types/generic";

const request = async (url: string) => {
    const saveSettings = get(settings).save;

    const request = {
        url,

        downloadMode: saveSettings.downloadMode,

        audioFormat: saveSettings.audioFormat,
        tiktokFullAudio: saveSettings.tiktokFullAudio,
        youtubeDubBrowserLang: saveSettings.youtubeDubBrowserLang,

        youtubeVideoCodec: saveSettings.youtubeVideoCodec,
        videoQuality: saveSettings.videoQuality,

        filenameStyle: saveSettings.filenameStyle,
        disableMetadata: saveSettings.disableMetadata,

        twitterGif: saveSettings.twitterGif,
        tiktokH265: saveSettings.tiktokH265,
    }

    if (env.DEFAULT_API && !get(settings).processing.seenOverrideWarning) {
        let _actions: {
            resolve: () => void;
            reject: () => void;
        };

        const promise = new Promise<void>(
            (resolve, reject) => (_actions = { resolve, reject })
        ).catch(() => {
            return {}
        });

        createDialog({
            id: "security-api-override",
            type: "small",
            icon: "warn-red",
            title: get(t)("dialog.api.override.title"),
            bodyText: get(t)("dialog.api.override.body", { value: env.DEFAULT_API }),
            dismissable: false,
            buttons: [
                {
                    text: get(t)("dialog.button.cancel"),
                    main: false,
                    action: () => {
                        _actions.reject();
                        updateSetting({
                            processing: {
                                seenOverrideWarning: true,
                            },
                        })
                    },
                },
                {
                    text: get(t)("dialog.button.continue"),
                    color: "red",
                    main: true,
                    timeout: 5000,
                    action: () => {
                        _actions.resolve();
                        updateSetting({
                            processing: {
                                allowDefaultOverride: true,
                                seenOverrideWarning: true,
                            },
                        })
                    },
                },
            ],
        })

        await promise;
    }

    let api = apiURL;
    if (env.DEFAULT_API && get(settings).processing.allowDefaultOverride) {
        api = env.DEFAULT_API;
    }

    const response: Optional<CobaltAPIResponse> = await fetch(api, {
        method: "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify(request),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).catch((e) => {
        if (e?.message?.includes("timed out")) {
            return {
                status: "error",
                error: {
                    code: "error.api.timed_out"
                }
            }
        }
    });

    return response;
}

const probeCobaltStream = async (url: string) => {
    const request = await fetch(`${url}&p=1`).catch(() => {});
    if (request?.status === 200) {
        return request?.status;
    }
    return 0;
}

export default {
    request,
    probeCobaltStream,
}
