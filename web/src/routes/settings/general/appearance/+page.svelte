<script lang="ts">
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    import { themeOptions } from "$lib/types/settings";
    import LanguageDropdown from "$components/settings/LanguageDropdown.svelte";
</script>

<SettingsCategory title="theme">
    <Switcher big={true}>
        {#each themeOptions as value}
            <SettingsButton settingContext="appearance" settingId="theme" settingValue={value}>
                {value}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory title="accessibility">
    <SettingsToggle
        settingContext="accessibility"
        settingId="reduceTransparency"
        title="reduce visual transparency"
        description="disables blur effects and reduces transparency of surfaces."
    />
    <SettingsToggle
        settingContext="accessibility"
        settingId="reduceAnimations"
        title="reduce animations"
        description="replaces rapid animations with smooth transitions."
    />
</SettingsCategory>

<SettingsCategory title="language">
    <LanguageDropdown />
    <SettingsToggle
        settingContext="appearance"
        settingId="autoLanguage"
        title="use default browser language"
        description="automatically picks the best language for you. if preferred browser language isn't available, english is used instead."
    />
</SettingsCategory>
