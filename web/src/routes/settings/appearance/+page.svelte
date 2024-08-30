<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { themeOptions } from "$lib/types/settings";

    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import LanguageDropdown from "$components/settings/LanguageDropdown.svelte";
</script>

<SettingsCategory sectionId="theme" title={$t("settings.theme")}>
    <Switcher big={true} description={$t("settings.theme.description")}>
        {#each themeOptions as value}
            <SettingsButton
                settingContext="appearance"
                settingId="theme"
                settingValue={value}
            >
                {$t(`settings.theme.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory sectionId="language" title={$t("settings.language")}>
    <SettingsToggle
        settingContext="appearance"
        settingId="autoLanguage"
        title={$t("settings.language.auto.title")}
        description={$t("settings.language.auto.description")}
    />
    <LanguageDropdown />
</SettingsCategory>

<SettingsCategory
    sectionId="accessibility"
    title={$t("settings.accessibility")}
>
    <SettingsToggle
        settingContext="appearance"
        settingId="reduceTransparency"
        title={$t("settings.accessibility.transparency.title")}
        description={$t("settings.accessibility.transparency.description")}
    />
    <SettingsToggle
        settingContext="appearance"
        settingId="reduceMotion"
        title={$t("settings.accessibility.motion.title")}
        description={$t("settings.accessibility.motion.description")}
    />
</SettingsCategory>
