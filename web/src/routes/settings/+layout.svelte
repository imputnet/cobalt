<script lang="ts">
    import settings from "$lib/state/settings";

    import { version } from "$lib/version";
    import { t } from "$lib/i18n/translations";

    import PageNav from "$components/subnav/PageNav.svelte";

    import PageNavTab from "$components/subnav/PageNavTab.svelte";
    import PageNavSection from "$components/subnav/PageNavSection.svelte";

    import IconLock from "@tabler/icons-svelte/IconLock.svelte";
    import IconSunHigh from "@tabler/icons-svelte/IconSunHigh.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconFileDownload from "@tabler/icons-svelte/IconFileDownload.svelte";

    import IconBug from "@tabler/icons-svelte/IconBug.svelte";
    import IconWorld from "@tabler/icons-svelte/IconWorld.svelte";
    import IconSettingsBolt from "@tabler/icons-svelte/IconSettingsBolt.svelte";

    $: versionText = $version ? `v${$version.version}-${$version.commit.slice(0, 8)}` : '\xa0';
</script>

<PageNav
    pageName="settings"
    pageSubtitle={versionText}
    homeNavPath="/settings"
    homeTitle={$t("tabs.settings")}
>
    <svelte:fragment slot="navigation">
        <PageNavSection>
            <PageNavTab
                tabPath="/settings/appearance"
                tabTitle={$t("settings.page.appearance")}
                iconColor="blue"
            >
                <IconSunHigh />
            </PageNavTab>
            <PageNavTab
                tabPath="/settings/privacy"
                tabTitle={$t("settings.page.privacy")}
                iconColor="blue"
            >
                <IconLock />
            </PageNavTab>
        </PageNavSection>

        <PageNavSection>
            <PageNavTab
                tabPath="/settings/video"
                tabTitle={$t("settings.page.video")}
                iconColor="green"
            >
                <IconMovie />
            </PageNavTab>
            <PageNavTab
                tabPath="/settings/audio"
                tabTitle={$t("settings.page.audio")}
                iconColor="green"
            >
                <IconMusic />
            </PageNavTab>
            <PageNavTab
                tabPath="/settings/download"
                tabTitle={$t("settings.page.download")}
                iconColor="green"
            >
                <IconFileDownload />
            </PageNavTab>
        </PageNavSection>

        <PageNavSection>
            <PageNavTab
                tabPath="/settings/instances"
                tabTitle={$t("settings.page.instances")}
                iconColor="gray"
            >
                <IconWorld />
            </PageNavTab>
            <PageNavTab
                tabPath="/settings/advanced"
                tabTitle={$t("settings.page.advanced")}
                iconColor="gray"
            >
                <IconSettingsBolt />
            </PageNavTab>
            {#if $settings.advanced.debug}
                <PageNavTab
                    tabPath="/settings/debug"
                    tabTitle={$t("settings.page.debug")}
                    iconColor="gray"
                >
                    <IconBug />
                </PageNavTab>
            {/if}
        </PageNavSection>
    </svelte:fragment>

    <slot slot="content"></slot>
</PageNav>
