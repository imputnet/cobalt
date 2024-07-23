<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { audioFormatOptions } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
</script>

<SettingsCategory sectionId="audio-format" title={$t("settings.audio.format")}>
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

<SettingsCategory sectionId="youtube" title={$t("settings.audio.youtube.dub")}>
    <SettingsToggle
        settingContext="save"
        settingId="youtubeDubBrowserLang"
        title={$t("settings.audio.youtube.dub.title")}
        description={$t("settings.audio.youtube.dub.description")}
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
