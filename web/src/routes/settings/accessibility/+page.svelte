<script lang="ts">
    import { device } from "$lib/device";
    import { t } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory
    sectionId="visual"
    title={$t("settings.accessibility.visual")}
>
    <SettingsToggle
        settingContext="accessibility"
        settingId="reduceMotion"
        title={$t("settings.accessibility.motion.title")}
        description={$t("settings.accessibility.motion.description")}
    />
    <SettingsToggle
        settingContext="accessibility"
        settingId="reduceTransparency"
        title={$t("settings.accessibility.transparency.title")}
        description={$t("settings.accessibility.transparency.description")}
    />
</SettingsCategory>

<SettingsCategory
    sectionId="behavior"
    title={$t("settings.accessibility.behavior")}
>
    <SettingsToggle
        settingContext="accessibility"
        settingId="dontAutoOpenQueue"
        title={$t("settings.accessibility.auto_queue.title")}
        description={$t("settings.accessibility.auto_queue.description")}
    />
</SettingsCategory>

{#if device.supports.haptics}
    <SettingsCategory
        sectionId="haptics"
        title={$t("settings.accessibility.haptics")}
    >
        <SettingsToggle
            settingContext="accessibility"
            settingId="disableHaptics"
            title={$t("settings.accessibility.haptics.title")}
            description={$t("settings.accessibility.haptics.description")}
        />
    </SettingsCategory>
{/if}
