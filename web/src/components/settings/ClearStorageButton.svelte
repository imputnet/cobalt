<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/state/dialogs";
    import { clearQueue } from "$lib/state/task-manager/queue";
    import { clearCacheStorage, clearFileStorage } from "$lib/storage";

    import IconFileShredder from "@tabler/icons-svelte/IconFileShredder.svelte";
    import DataSettingsButton from "$components/settings/DataSettingsButton.svelte";

    const clearDialog = () => {
        createDialog({
            id: "wipe-confirm",
            type: "small",
            icon: "warn-red",
            title: $t("dialog.clear_cache.title"),
            bodyText: $t("dialog.clear_cache.body"),
            buttons: [
                {
                    text: $t("button.cancel"),
                    main: false,
                    action: () => {},
                },
                {
                    text: $t("button.clear"),
                    color: "red",
                    main: true,
                    timeout: 2000,
                    action: async () => {
                        clearQueue();
                        await clearFileStorage();
                        await clearCacheStorage();
                    },
                },
            ],
        });
    };
</script>

<DataSettingsButton id="clear-cache" click={clearDialog} danger>
    <IconFileShredder />
    {$t("button.clear_cache")}
</DataSettingsButton>
