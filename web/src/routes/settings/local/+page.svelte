<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";
    import { localProcessingOptions } from "$lib/types/settings";

    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory sectionId="media-processing" title={$t("settings.local.saving")} beta>
    <Switcher big={true} description={$t("settings.local.saving.description")}>
        {#each localProcessingOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="localProcessing"
                settingValue={value}
            >
                {$t(`settings.local.saving.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

{#if env.ENABLE_WEBCODECS}
    <SettingsCategory sectionId="webcodecs" title={$t("settings.local.webcodecs")} beta>
        <SettingsToggle
            settingContext="advanced"
            settingId="useWebCodecs"
            title={$t("settings.local.webcodecs.title")}
            description={$t("settings.local.webcodecs.description")}
        />
    </SettingsCategory>
{/if}
