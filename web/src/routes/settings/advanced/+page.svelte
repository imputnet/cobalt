<script>
    import { t } from "$lib/i18n/translations";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory sectionId="debug" title={$t("settings.advanced.debug")}>
    <SettingsToggle
        settingContext="advanced"
        settingId="debug"
        title={$t("settings.advanced.debug.title")}
        description={$t("settings.advanced.debug.description")}
    />
</SettingsCategory>
