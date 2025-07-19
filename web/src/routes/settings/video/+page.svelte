<script lang="ts">
    import env from "$lib/env";
    import settings from "$lib/state/settings";
    import { t } from "$lib/i18n/translations";

    import { videoQualityOptions, youtubeVideoContainerOptions } from "$lib/types/settings";
    import { youtubeVideoCodecOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    const codecTitles = {
        h264: "h264 + aac",
        av1: "av1 + opus",
        vp9: "vp9 + opus",
    }
</script>

<SettingsCategory
    sectionId="quality"
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
                {codecTitles[value]}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="youtube-container"
    title={$t("settings.video.youtube.container")}
>
    <Switcher
        big={true}
        description={$t("settings.video.youtube.container.description")}
    >
        {#each youtubeVideoContainerOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="youtubeVideoContainer"
                settingValue={value}
            >
                {value}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

{#if env.ENABLE_DEPRECATED_YOUTUBE_HLS}
    <SettingsCategory
        sectionId="youtube-hls"
        title={$t("settings.video.youtube.hls")}
        disabled={$settings.save.youtubeVideoCodec === "av1"}
        beta
    >
        <SettingsToggle
            settingContext="save"
            settingId="youtubeHLS"
            title={$t("settings.video.youtube.hls.title")}
            description={$t("settings.video.youtube.hls.description")}
            disabled={$settings.save.youtubeVideoCodec === "av1"}
        />
    </SettingsCategory>
{/if}

<SettingsCategory sectionId="h265" title={$t("settings.video.h265")}>
    <SettingsToggle
        settingContext="save"
        settingId="allowH265"
        title={$t("settings.video.h265.title")}
        description={$t("settings.video.h265.description")}
    />
</SettingsCategory>

<SettingsCategory sectionId="convert-gif" title={$t("settings.video.twitter.gif")}>
    <SettingsToggle
        settingContext="save"
        settingId="convertGif"
        title={$t("settings.video.twitter.gif.title")}
        description={$t("settings.video.twitter.gif.description")}
    />
</SettingsCategory>

