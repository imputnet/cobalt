<script lang="ts">
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsCheckbox from "$components/buttons/SettingsCheckbox.svelte";

    import { audioFormatOptions } from "$lib/types/settings";

    const audioDescription = `cobalt converts every format but "best", therefore all formats but "best" will be lossy.`;
</script>

<SettingsCategory
    title="preferred audio format"
    description="{audioDescription}"
>
    <Switcher big={true}>
        {#each audioFormatOptions as value}
            <SettingsButton settingContext="save" settingId="audioFormat" settingValue={value}>
                {value}
            </SettingsButton>
        {/each}
    </Switcher>

</SettingsCategory>

<SettingsCategory title="youtube">
    <SettingsCheckbox
        settingContext="save"
        settingId="youtubeDubBrowserLang"
        title="use browser language for dubbed videos"
        description="works even if cobalt ui isn't translated to your language."
    />
</SettingsCategory>

<SettingsCategory title="tiktok">
    <SettingsCheckbox
        settingContext="save"
        settingId="tiktokFullAudio"
        title="use original sound"
        description="downloads original sound used in the post without any additional changes by the post's author."
    />
</SettingsCategory>
