<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory sectionId="override" title={$t("settings.processing.override")}>
    <SettingsToggle
        settingContext="processing"
        settingId="allowDefaultOverride"
        title={$t("settings.processing.override.title")}
        description={$t("settings.processing.override.description")}
    />
</SettingsCategory>
