<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { filenameStyleOptions, savingMethodOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import FilenamePreview from "$components/settings/FilenamePreview.svelte";
</script>

<SettingsCategory sectionId="filename" title={$t("settings.metadata.filename")}>
    <div class="category-inside-group">
        <Switcher big={true}>
            {#each filenameStyleOptions as value}
                <SettingsButton
                    settingContext="save"
                    settingId="filenameStyle"
                    settingValue={value}
                >
                    {$t(`settings.metadata.filename.${value}`)}
                </SettingsButton>
            {/each}
        </Switcher>
        <FilenamePreview />
    </div>
    <div class="subtext">
        {$t("settings.metadata.filename.description")}
    </div>
</SettingsCategory>

<SettingsCategory sectionId="saving" title={$t("settings.saving.title")}>
    <Switcher big={true} description={$t("settings.saving.description")}>
        {#each savingMethodOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="savingMethod"
                settingValue={value}
            >
                {$t(`settings.saving.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="disable-metadata"
    title={$t("settings.metadata.file")}
>
    <SettingsToggle
        settingContext="save"
        settingId="disableMetadata"
        title={$t("settings.metadata.disable.title")}
        description={$t("settings.metadata.disable.description")}
    />
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
