<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { themeOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    import LanguageDropdown from "$components/settings/LanguageDropdown.svelte";
    import LanguageAutoToggle from "$components/settings/LanguageAutoToggle.svelte";
</script>

<SettingsCategory
    sectionId="theme"
    title={$t("settings.theme")}
    description={$t("settings.theme.description")}
>
    <Switcher big={true}>
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
    <LanguageAutoToggle
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
        settingContext="accessibility"
        settingId="reduceTransparency"
        title={$t("settings.accessibility.transparency.title")}
        description={$t("settings.accessibility.transparency.description")}
    />
    <SettingsToggle
        settingContext="accessibility"
        settingId="reduceAnimations"
        title={$t("settings.accessibility.animations.title")}
        description={$t("settings.accessibility.animations.description")}
    />
</SettingsCategory>
