<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import ResetSettingsButton from "$components/buttons/ResetSettingsButton.svelte";
    import TransferSettings from "$components/settings/TransferSettings.svelte";
    import { storedSettings } from "$lib/state/settings";
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
    <TransferSettings />
    {#if $storedSettings.schemaVersion}
        <ResetSettingsButton />
    {/if}
</SettingsCategory>
