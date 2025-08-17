<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/state/dialogs";
    import { resetSettings } from "$lib/state/settings";

    import IconRestore from "@tabler/icons-svelte/IconRestore.svelte";
    import DataSettingsButton from "$components/settings/DataSettingsButton.svelte";

    const resetDialog = () => {
        createDialog({
            id: "wipe-confirm",
            type: "small",
            icon: "warn-red",
            title: $t("dialog.reset_settings.title"),
            bodyText: $t("dialog.reset_settings.body"),
            buttons: [
                {
                    text: $t("button.cancel"),
                    main: false,
                    action: () => {},
                },
                {
                    text: $t("button.reset"),
                    color: "red",
                    main: true,
                    timeout: 2000,
                    action: () => resetSettings(),
                },
            ],
        });
    };
</script>

<DataSettingsButton id="reset-settings" click={resetDialog} danger>
    <IconRestore />
    {$t("button.reset")}
</DataSettingsButton>
