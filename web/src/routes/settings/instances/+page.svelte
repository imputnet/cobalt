<script lang="ts">
    import settings from "$lib/state/settings";

    import { t } from "$lib/i18n/translations";

    import SettingsInput from "$components/settings/SettingsInput.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory
    sectionId="community"
    title={$t("settings.processing.community")}
>
    <div class="category-inside-group">
        <SettingsToggle
            settingContext="processing"
            settingId="enableCustomInstances"
            title={$t("settings.processing.enable_custom.title")}
        />
        {#if $settings.processing.enableCustomInstances}
            <SettingsInput
                settingContext="processing"
                settingId="customInstanceURL"
                placeholder="https://instance.url.example/"
            />
        {/if}
    </div>
    <div class="subtext">
        {$t("settings.processing.enable_custom.description")}
    </div>
</SettingsCategory>

<style>
    .category-inside-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .subtext {
        margin-top: -3px;
    }
</style>
