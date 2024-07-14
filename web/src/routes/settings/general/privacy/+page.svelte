<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory sectionId="privacy" title={$t("settings.privacy")}>
    <SettingsToggle
        settingContext="privacy"
        settingId="disableAnalytics"
        title={$t("settings.privacy.disableAnalytics.title")}
        description={$t("settings.privacy.disableAnalytics.description")}
    />
</SettingsCategory>