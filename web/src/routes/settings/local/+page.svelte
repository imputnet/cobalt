<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory sectionId="media-processing" title={$t("settings.local.saving")} beta>
    <SettingsToggle
        settingContext="save"
        settingId="localProcessing"
        title={$t("settings.local.saving.title")}
        description={$t("settings.local.saving.description")}
    />
</SettingsCategory>

<SettingsCategory sectionId="webcodecs" title={$t("settings.local.webcodecs")} beta>
    <SettingsToggle
        settingContext="advanced"
        settingId="useWebCodecs"
        title={$t("settings.local.webcodecs.title")}
        description={$t("settings.local.webcodecs.description")}
    />
</SettingsCategory>
