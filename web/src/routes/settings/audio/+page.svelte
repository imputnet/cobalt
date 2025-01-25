<script lang="ts">
    import settings from "$lib/state/settings";
    import { t } from "$lib/i18n/translations";
    import { namedYoutubeLanguages } from "$lib/settings/youtube-lang";

    import { audioFormatOptions, audioBitrateOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsDropdown from "$components/settings/SettingsDropdown.svelte";

    const displayLangs = namedYoutubeLanguages();
</script>

<SettingsCategory sectionId="format" title={$t("settings.audio.format")}>
    <Switcher big={true} description={$t("settings.audio.format.description")}>
        {#each audioFormatOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="audioFormat"
                settingValue={value}
            >
                {$t(`settings.audio.format.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="bitrate"
    title={$t("settings.audio.bitrate")}
    disabled={["wav", "best"].includes($settings.save.audioFormat)}
>
    <Switcher big={true} description={$t("settings.audio.bitrate.description")}>
        {#each audioBitrateOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="audioBitrate"
                settingValue={value}
            >
                {value}{$t("settings.audio.bitrate.kbps")}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="youtube-dub"
    title={$t("settings.audio.youtube.dub")}
    beta
>
    <SettingsDropdown
        title={$t("settings.audio.youtube.dub.title")}
        description={$t("settings.audio.youtube.dub.description")}
        items={displayLangs}
        settingContext="save"
        settingId="youtubeDubLang"
        selectedOption={$settings.save.youtubeDubLang}
        selectedTitle={displayLangs[$settings.save.youtubeDubLang]}
    />
</SettingsCategory>

<SettingsCategory
    sectionId="tiktok"
    title={$t("settings.audio.tiktok.original")}
>
    <SettingsToggle
        settingContext="save"
        settingId="tiktokFullAudio"
        title={$t("settings.audio.tiktok.original.title")}
        description={$t("settings.audio.tiktok.original.description")}
    />
</SettingsCategory>
