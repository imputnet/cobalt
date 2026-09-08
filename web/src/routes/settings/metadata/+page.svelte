<script lang="ts">
    import settings from "$lib/state/settings";
    import { t } from "$lib/i18n/translations";

    import { namedSubtitleLanguages } from "$lib/settings/audio-sub-language";
    import {
        captionFormatOptions,
        filenameStyleOptions,
        savingMethodOptions,
        transcriptMethodOptions,
    } from "$lib/types/settings";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import Switcher from "$components/buttons/Switcher.svelte";
    import SettingsButton from "$components/buttons/SettingsButton.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import FilenamePreview from "$components/settings/FilenamePreview.svelte";
    import SettingsDropdown from "$components/settings/SettingsDropdown.svelte";

    const displayLangs = namedSubtitleLanguages($t);
    const displayCaptionLangs: Record<string, string> = {
        ...displayLangs,
        none: $t("settings.captions.language.automatic"),
    };
    const displayCaptionFormats = Object.fromEntries(
        captionFormatOptions.map(format => [format, $t(`settings.captions.format.${format}`)])
    );
    const displayTranscriptMethods = Object.fromEntries(
        transcriptMethodOptions.map(method => [method, $t(`settings.saving.${method}`)])
    );
</script>

<SettingsCategory sectionId="filename" title={$t("settings.metadata.filename")}>
    <div class="category-inside-group">
        <Switcher big={true}>
            {#each filenameStyleOptions as value}
                <SettingsButton
                    settingContext="save"
                    settingId="filenameStyle"
                    settingValue={value}
                >
                    {$t(`settings.metadata.filename.${value}`)}
                </SettingsButton>
            {/each}
        </Switcher>
        <FilenamePreview />
    </div>
    <div class="subtext">
        {$t("settings.metadata.filename.description")}
    </div>
</SettingsCategory>

<SettingsCategory
    sectionId="transcripts"
    title={$t("settings.captions")}
>
    <SettingsDropdown
        title={$t("settings.captions.format")}
        description={$t("settings.captions.format.description")}
        items={displayCaptionFormats}
        settingContext="save"
        settingId="captionFormat"
        selectedOption={$settings.save.captionFormat}
        selectedTitle={displayCaptionFormats[$settings.save.captionFormat]}
    />
    <SettingsDropdown
        title={$t("settings.captions.method")}
        description={$t("settings.captions.method.description")}
        items={displayTranscriptMethods}
        settingContext="save"
        settingId="transcriptMethod"
        selectedOption={$settings.save.transcriptMethod}
        selectedTitle={displayTranscriptMethods[$settings.save.transcriptMethod]}
    />
    <SettingsDropdown
        title={$t("settings.captions.language")}
        description={$t("settings.captions.language.description")}
        items={displayCaptionLangs}
        settingContext="save"
        settingId="captionLang"
        selectedOption={$settings.save.captionLang}
        selectedTitle={displayCaptionLangs[$settings.save.captionLang]}
    />
</SettingsCategory>

<SettingsCategory sectionId="saving" title={$t("settings.saving.title")}>
    <Switcher big={true} description={$t("settings.saving.description")}>
        {#each savingMethodOptions as value}
            <SettingsButton
                settingContext="save"
                settingId="savingMethod"
                settingValue={value}
            >
                {$t(`settings.saving.${value}`)}
            </SettingsButton>
        {/each}
    </Switcher>
</SettingsCategory>

<SettingsCategory
    sectionId="subtitles"
    title={$t("settings.subtitles")}
>
    <SettingsDropdown
        title={$t("settings.subtitles.title")}
        description={$t("settings.subtitles.description")}
        items={displayLangs}
        settingContext="save"
        settingId="subtitleLang"
        selectedOption={$settings.save.subtitleLang}
        selectedTitle={displayLangs[$settings.save.subtitleLang]}
    />
</SettingsCategory>

<SettingsCategory
    sectionId="metadata"
    title={$t("settings.metadata.file")}
>
    <SettingsToggle
        settingContext="save"
        settingId="disableMetadata"
        title={$t("settings.metadata.disable.title")}
        description={$t("settings.metadata.disable.description")}
    />
</SettingsCategory>

<style>
    .category-inside-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .subtext {
        margin-top: -3px;
    }
</style>
