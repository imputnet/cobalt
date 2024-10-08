<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { createDialog } from "$lib/dialogs";
    import { resetSettings } from "$lib/state/settings";

    import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";

    const resetDialog = () => {
        createDialog({
            id: "wipe-confirm",
            type: "small",
            icon: "warn-red",
            title: $t("dialog.reset.title"),
            bodyText: $t("dialog.reset.body"),
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

<button id="setting-button-reset" class="button" on:click={resetDialog}>
    <IconTrash />
    {$t("button.reset")}
</button>

<style>
    #setting-button-reset {
        background-color: var(--red);
        color: var(--white);
        width: max-content;
        text-align: left;
    }

    #setting-button-reset:hover {
        background-color: var(--dark-red);
    }

    #setting-button-reset :global(svg) {
        stroke-width: 2px;
        height: 24px;
        width: 24px;
    }
</style>
