<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import OuterLink from "$components/misc/OuterLink.svelte";
</script>

<SettingsCategory sectionId="privacy" title={$t("settings.privacy.analytics")}>
    <SettingsToggle
        settingContext="privacy"
        settingId="disableAnalytics"
        title={$t("settings.privacy.analytics.title")}
        description={$t("settings.privacy.analytics.description")}
    />
    <div class="subtext learn-more-plausible">
        <OuterLink href="https://plausible.io/privacy-focused-web-analytics">
            {$t("settings.privacy.analytics.learnmore")}
        </OuterLink>
    </div>
</SettingsCategory>

<style>
    .learn-more-plausible {
        padding-top: 6px;
    }
</style>
