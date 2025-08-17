<script lang="ts">
    import settings from "$lib/state/settings";

    import { device } from "$lib/device";
    import { themeOptions } from "$lib/types/settings";
    import { t, locales } from "$lib/i18n/translations";

    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsDropdown from "$components/settings/SettingsDropdown.svelte";

    const dropdownItems = () => {
        return $locales.reduce((obj, lang) => {
            return {
                ...obj,
                [lang]: $t(`languages.${lang}`),
            };
        }, {});
    };
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

    <SettingsDropdown
        title={$t("settings.language.preferred.title")}
        description={$t("settings.language.preferred.description")}
        items={dropdownItems()}
        settingContext="appearance"
        settingId="language"
        selectedOption={$settings.appearance.language}
        selectedTitle={$t(`languages.${$settings.appearance.language}`)}
        disabled={$settings.appearance.autoLanguage}
    />
</SettingsCategory>

{#if device.is.mobile}
    <SettingsCategory sectionId="tabs" title={$t("settings.tabs")}>
        <SettingsToggle
            settingContext="appearance"
            settingId="hideRemuxTab"
            title={$t("settings.tabs.hide_remux")}
            description={$t("settings.tabs.hide_remux.description")}
        />
    </SettingsCategory>
{/if}
