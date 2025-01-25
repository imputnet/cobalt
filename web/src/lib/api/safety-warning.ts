import { get } from "svelte/store";
import { t } from "$lib/i18n/translations";
import settings, { updateSetting } from "$lib/state/settings";

import { createDialog } from "$lib/state/dialogs";

export const customInstanceWarning = async () => {
    if (get(settings).processing.seenCustomWarning) {
        return;
    }

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
        id: "security-api-custom",
        type: "small",
        icon: "warn-red",
        title: get(t)("dialog.safety.title"),
        bodyText: get(t)("dialog.safety.custom_instance.body"),
        leftAligned: true,
        buttons: [
            {
                text: get(t)("button.cancel"),
                main: false,
                action: () => {
                    _actions.reject();
                },
            },
            {
                text: get(t)("button.continue"),
                color: "red",
                main: true,
                timeout: 5000,
                action: () => {
                    _actions.resolve();
                    updateSetting({
                        processing: {
                            seenCustomWarning: true,
                        },
                    })
                },
            },
        ],
    })

    await promise;
}
