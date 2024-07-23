<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { videoQualityOptions } from "$lib/types/settings";
    import { youtubeVideoCodecOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory
    sectionId="video-quality"
    title={$t("settings.video.quality")}
>
    <Switcher big={true} description={$t("settings.video.quality.description")}>
        {#each videoQualityOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="videoQuality"
                settingValue={value}
            >
                {$t(`settings.video.quality.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="youtube-codec"
    title={$t("settings.video.youtube.codec")}
>
    <Switcher
        big={true}
        description={$t("settings.video.youtube.codec.description")}
    >
        {#each youtubeVideoCodecOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="youtubeVideoCodec"
                settingValue={value}
            >
                {$t(`settings.video.youtube.codec.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory sectionId="twitter" title={$t("settings.video.twitter.gif")}>
    <SettingsToggle
        settingContext="save"
        settingId="twitterGif"
        title={$t("settings.video.twitter.gif.title")}
        description={$t("settings.video.twitter.gif.description")}
    />
</SettingsCategory>

<SettingsCategory sectionId="tiktok" title={$t("settings.video.tiktok.h265")}>
    <SettingsToggle
        settingContext="save"
        settingId="tiktokH265"
        title={$t("settings.video.tiktok.h265.title")}
        description={$t("settings.video.tiktok.h265.description")}
    />
</SettingsCategory>
