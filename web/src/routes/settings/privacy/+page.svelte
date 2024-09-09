<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import OuterLink from "$components/misc/OuterLink.svelte";
    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";
    import SettingsCategory from "$components/settings/SettingsCategory.svelte";
</script>

<SettingsCategory sectionId="tunnel" title={$t("settings.privacy.tunnel")} beta>
    <SettingsToggle
        settingContext="privacy"
        settingId="alwaysProxy"
        title={$t("settings.privacy.tunnel.title")}
        description={$t("settings.privacy.tunnel.description")}
    />
</SettingsCategory>

{#if env.PLAUSIBLE_ENABLED}
    <SettingsCategory sectionId="analytics" title={$t("settings.privacy.analytics")}>
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
{/if}

<style>
    .learn-more-plausible {
        padding-top: 6px;
    }
</style>
