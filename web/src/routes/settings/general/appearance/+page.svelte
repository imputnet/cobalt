<script lang="ts">
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsCheckbox from "$components/buttons/SettingsCheckbox.svelte";

    import { themeOptions } from "$lib/types/settings";
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
    <SettingsCheckbox
        settingContext="accessibility"
        settingId="reduceTransparency"
        title="reduce visual transparency"
        description="disables blur effects and reduces transparency of surfaces."
    />
    <SettingsCheckbox
        settingContext="accessibility"
        settingId="reduceAnimations"
        title="reduce animations"
        description="replaces rapid animations with smooth transitions."
    />
</SettingsCategory>
