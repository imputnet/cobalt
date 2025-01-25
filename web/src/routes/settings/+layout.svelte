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
    import IconAdjustmentsStar from "@tabler/icons-svelte/IconAdjustmentsStar.svelte";

    $: versionText = $version
        ? `v${$version.version}-${$version.commit.slice(0, 8)}`
        : "\xa0";
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
                path="/settings/appearance"
                title={$t("settings.page.appearance")}
                icon={IconSunHigh}
                iconColor="blue"
            />
            <PageNavTab
                path="/settings/privacy"
                title={$t("settings.page.privacy")}
                icon={IconLock}
                iconColor="blue"
            />
        </PageNavSection>

        <PageNavSection>
            <PageNavTab
                path="/settings/video"
                title={$t("settings.page.video")}
                icon={IconMovie}
                iconColor="green"
            />
            <PageNavTab
                path="/settings/audio"
                title={$t("settings.page.audio")}
                icon={IconMusic}
                iconColor="green"
            />
            <PageNavTab
                path="/settings/download"
                title={$t("settings.page.download")}
                icon={IconFileDownload}
                iconColor="green"
            />
        </PageNavSection>

        <PageNavSection>
            <PageNavTab
                path="/settings/instances"
                title={$t("settings.page.instances")}
                icon={IconWorld}
                iconColor="gray"
            />
            <PageNavTab
                path="/settings/advanced"
                title={$t("settings.page.advanced")}
                icon={IconAdjustmentsStar}
                iconColor="gray"
            />
            {#if $settings.advanced.debug}
                <PageNavTab
                    path="/settings/debug"
                    title={$t("settings.page.debug")}
                    icon={IconBug}
                    iconColor="gray"
                />
            {/if}
        </PageNavSection>
    </svelte:fragment>

    <slot slot="content"></slot>
</PageNav>
