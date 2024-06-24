<script lang="ts">
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsCheckbox from "$components/buttons/SettingsCheckbox.svelte";

    import { videoQualityOptions } from "$lib/types/settings";
    import { youtubeVideoCodecOptions } from "$lib/types/settings";

    const videoDescription = `if preferred quality isn’t available, closest one is picked instead.`;
    const codecDescription = `if preferred codec isn’t available, next best is picked instead.`;
</script>

<SettingsCategory
    title="preferred video quality"
    description="{videoDescription}"
>
    <Switcher big={true}>
        {#each videoQualityOptions as value}
            <SettingsButton settingContext="save" settingId="videoQuality" settingValue={value}>
                {value}
            </SettingsButton>
        {/each}
    </Switcher>

</SettingsCategory>

<SettingsCategory
    title="preferred youtube codec"
    description="{codecDescription}"
>
    <Switcher big={true}>
        {#each youtubeVideoCodecOptions as value}
            <SettingsButton settingContext="save" settingId="youtubeVideoCodec" settingValue={value}>
                {value}
            </SettingsButton>
        {/each}
    </Switcher>

</SettingsCategory>

<SettingsCategory title="twitter">
    <SettingsCheckbox
        settingContext="save"
        settingId="twitterGif"
        title="convert looping videos to GIF"
        description="GIF conversion is very lossy, end result may be low quality."
    />
</SettingsCategory>

<SettingsCategory title="tiktok">
    <SettingsCheckbox
        settingContext="save"
        settingId="tiktokH265"
        title="prefer HEVC/H265 format"
        description="allows 1080p video downloading at cost of compatibility."
    />
</SettingsCategory>
