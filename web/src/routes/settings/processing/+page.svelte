<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

{#if env.DEFAULT_API}
    <SettingsCategory sectionId="override" title={$t("settings.processing.override")}>
        <SettingsToggle
            settingContext="processing"
            settingId="allowDefaultOverride"
            title={$t("settings.processing.override.title")}
            description={$t("settings.processing.override.description")}
        />
    </SettingsCategory>
{/if}
