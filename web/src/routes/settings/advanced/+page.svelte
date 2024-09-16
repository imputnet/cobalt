<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import ManageSettings from "$components/settings/ManageSettings.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory sectionId="debug" title={$t("settings.advanced.debug")}>
    <SettingsToggle
        settingContext="advanced"
        settingId="debug"
        title={$t("settings.advanced.debug.title")}
        description={$t("settings.advanced.debug.description")}
    />
</SettingsCategory>

<SettingsCategory sectionId="data" title={$t("settings.advanced.data")}>
    <ManageSettings />
</SettingsCategory>
