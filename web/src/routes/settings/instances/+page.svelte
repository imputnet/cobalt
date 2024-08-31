<script lang="ts">
    import env from "$lib/env";
    import settings from "$lib/state/settings";

    import { t } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import CustomInstanceInput from "$components/settings/CustomInstanceInput.svelte";

    $: overrideDisabled = $settings.processing.enableCustomInstances;
</script>

{#if env.DEFAULT_API}
    <SettingsCategory
        sectionId="override"
        title={$t("settings.processing.override")}
        disabled={overrideDisabled}
    >
        <SettingsToggle
            settingContext="processing"
            settingId="allowDefaultOverride"
            title={$t("settings.processing.override.title")}
            description={$t("settings.processing.override.description")}
            disabled={overrideDisabled}
        />
    </SettingsCategory>
{/if}

<SettingsCategory
    sectionId="community"
    title={$t("settings.processing.community")}
    beta
>
    <div class="category-inside-group">
        <SettingsToggle
            settingContext="processing"
            settingId="enableCustomInstances"
            title={$t("settings.processing.enable_custom.title")}
        />
        {#if $settings.processing.enableCustomInstances}
            <CustomInstanceInput />
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
