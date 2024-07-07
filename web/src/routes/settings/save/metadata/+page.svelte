<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { filenameStyleOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory
    sectionId="filename"
    title={$t("settings.metadata.filename")}
    description={$t("settings.metadata.filename.description")}
>
    <Switcher big={true}>
        {#each filenameStyleOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="filenameStyle"
                settingValue={value}
            >
                {$t(`settings.metadata.filename.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="disable-metadata"
    title={$t("settings.metadata.file")}
>
    <SettingsToggle
        settingContext="save"
        settingId="disableMetadata"
        title={$t("settings.metadata.disable.title")}
        description={$t("settings.metadata.disable.description")}
    />
</SettingsCategory>

<SettingsCategory sectionId="saving" title={$t("settings.saving.method")}>
    <SettingsToggle
        settingContext="save"
        settingId="downloadPopup"
        title={$t("settings.saving.ask.title")}
        description={$t("settings.saving.ask.description")}
    />
</SettingsCategory>
