<script lang="ts">
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    import { filenameStyleOptions } from "$lib/types/settings";
</script>

<SettingsCategory
    title="filename style"
    description="very cool description for every style. bla bla bla."
>
    <Switcher big={true}>
        {#each filenameStyleOptions as value}
            <SettingsButton settingContext="save" settingId="filenameStyle" settingValue={value}>
                {value}
            </SettingsButton>
        {/each}
    </Switcher>

</SettingsCategory>

<SettingsCategory title="file metadata">
    <SettingsToggle
        settingContext="save"
        settingId="disableMetadata"
        title="disable file metadata"
        description="cobalt won't add title, artist, and other info to the file."
    />
</SettingsCategory>

<SettingsCategory title="saving method">
    <SettingsToggle
        settingContext="save"
        settingId="downloadPopup"
        title="ask how to save"
        description="cobalt will offer you several ways to save the file instead of opening it in a new tab."
    />
</SettingsCategory>
