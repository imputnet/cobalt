<script lang="ts">
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    import settings from "$lib/state/settings";
    import { version } from "$lib/version";

    import { t } from "$lib/i18n/translations";

    import SettingsNavTab from "$components/settings/SettingsNavTab.svelte";
    import SettingsNavSection from "$components/settings/SettingsNavSection.svelte";

    import IconSunHigh from "@tabler/icons-svelte/IconSunHigh.svelte";
    import IconLock from "@tabler/icons-svelte/IconLock.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconFileDownload from "@tabler/icons-svelte/IconFileDownload.svelte";

    import IconBug from "@tabler/icons-svelte/IconBug.svelte";
    import IconWorld from "@tabler/icons-svelte/IconWorld.svelte";
    import IconSettingsBolt from "@tabler/icons-svelte/IconSettingsBolt.svelte";

    import IconArrowLeft from "@tabler/icons-svelte/IconArrowLeft.svelte";

    import { goto } from "$app/navigation";
    import { defaultSettingsPage } from "$lib/settings/defaults";

    let screenWidth: number;

    $: versionText = $version ? `v${$version.version}-${$version.commit.slice(0, 8)}` : '\xa0';

    $: currentPageTitle = $page.url.pathname.split("/").at(-1);
    $: stringPageTitle =
        currentPageTitle !== "settings"
            ? ` / ${$t(`settings.page.${currentPageTitle}`)}`
            : "";

    $: isMobile = screenWidth <= 750;
    $: isHome = $page.url.pathname === "/settings";
    $: {
        if (browser && !isMobile && isHome) {
            goto(defaultSettingsPage(), { replaceState: true });
        }
    }
</script>

<svelte:head>
    <title>
        {$t("tabs.settings")}{stringPageTitle} ~ {$t("general.cobalt")}
    </title>
</svelte:head>

<svelte:window bind:innerWidth={screenWidth} />

<div id="settings-page">
    <div id="settings-sidebar" class:back-visible={!isHome && isMobile}>
        <div id="settings-header">
            {#if isMobile}
                {#if !isHome}
                    <a
                        class="back-button"
                        href="/settings"
                        role="button"
                        aria-label={$t("a11y.general.back")}
                    >
                        <IconArrowLeft />
                    </a>
                {/if}
                <h3
                    id="settings-page-title"
                    aria-level="1"
                    tabindex="-1"
                    data-first-focus
                    data-focus-ring-hidden
                >
                    {#if !isHome}
                        {$t(`settings.page.${currentPageTitle}`)}
                    {:else}
                        {$t("tabs.settings")}
                    {/if}
                </h3>
            {:else}
                <div class="subtext settings-version">
                    {versionText}
                </div>
                <h2 id="settings-page-title" aria-level="1">
                    {$t("tabs.settings")}
                </h2>
            {/if}
        </div>
        <nav id="settings-navigation" class:visible-mobile={isMobile && isHome}>
            <SettingsNavSection>
                <SettingsNavTab
                    tabName="appearance"
                    tabLink="appearance"
                    iconColor="blue"
                >
                    <IconSunHigh />
                </SettingsNavTab>
                <SettingsNavTab
                    tabName="privacy"
                    tabLink="privacy"
                    iconColor="blue"
                >
                    <IconLock />
                </SettingsNavTab>
            </SettingsNavSection>

            <SettingsNavSection>
                <SettingsNavTab
                    tabName="video"
                    tabLink="video"
                    iconColor="green"
                >
                    <IconMovie />
                </SettingsNavTab>
                <SettingsNavTab
                    tabName="audio"
                    tabLink="audio"
                    iconColor="green"
                >
                    <IconMusic />
                </SettingsNavTab>
                <SettingsNavTab
                    tabName="download"
                    tabLink="download"
                    iconColor="green"
                >
                    <IconFileDownload />
                </SettingsNavTab>
            </SettingsNavSection>

            <SettingsNavSection>
                <SettingsNavTab
                    tabName="instances"
                    tabLink="instances"
                    iconColor="gray"
                >
                    <IconWorld />
                </SettingsNavTab>
                <SettingsNavTab
                    tabName="advanced"
                    tabLink="advanced"
                    iconColor="gray"
                >
                    <IconSettingsBolt />
                </SettingsNavTab>
                {#if $settings.advanced.debug}
                    <SettingsNavTab
                        tabName="debug"
                        tabLink="debug"
                        iconColor="gray"
                    >
                        <IconBug />
                    </SettingsNavTab>
                {/if}
            </SettingsNavSection>

            {#if isMobile && isHome}
                <div class="subtext settings-version center">
                    {versionText}
                </div>
            {/if}
        </nav>
    </div>

    {#if !isMobile || !isHome}
        <main
            id="settings-page-content"
            tabindex="-1"
            data-first-focus
            data-focus-ring-hidden
        >
            <slot></slot>
        </main>
    {/if}
</div>

<style>
    #settings-page {
        --settings-nav-width: 250px;
        --settings-padding: 30px;
        --settings-padding-small: calc(
            var(--settings-padding) - var(--padding)
        );
        display: grid;
        width: 100%;
        grid-template-columns: var(--settings-nav-width) 1fr;
        overflow: hidden;
        padding-left: var(--settings-padding);
    }

    #settings-page-content {
        display: flex;
        flex-direction: column;
        max-width: 600px;
        padding: calc(var(--settings-padding) / 2);
        overflow-y: scroll;
    }

    #settings-sidebar,
    #settings-navigation {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
    }

    #settings-sidebar {
        width: var(--settings-nav-width);
        padding-top: var(--settings-padding);
    }

    #settings-sidebar.back-visible {
        overflow: visible;
    }

    #settings-sidebar {
        gap: var(--padding);
    }

    #settings-navigation {
        gap: var(--padding);
        padding-bottom: var(--padding);
    }

    #settings-header {
        --back-padding: calc(var(--padding) / 2);
    }

    .settings-version {
        padding: 0;
    }

    .settings-version.center {
        text-align: center;
    }

    .back-button {
        display: flex;
        align-items: center;
        color: var(--secondary);
        gap: var(--back-padding);
        padding: var(--back-padding);

        position: absolute;
        left: var(--back-padding);
    }

    .back-button:active {
        background: var(--button-hover-transparent);
        border-radius: var(--border-radius);
    }

    .back-button :global(svg) {
        stroke-width: 1.8px;
        height: 22px;
        width: 22px;
        will-change: transform;
    }

    @media screen and (max-width: 750px) {
        #settings-page {
            --settings-nav-width: 100%;
            display: flex;
            flex-direction: column;
            grid-template-columns: 1fr;
            padding: 0;
        }

        #settings-navigation {
            padding: var(--padding);
            padding-bottom: calc(var(--padding) * 2);
        }

        #settings-page-content {
            padding: var(--padding) 0;
            padding-top: 0;
        }

        #settings-page-content {
            max-width: unset;
        }

        #settings-header {
            display: flex;
            align-items: center;
            position: sticky;
            padding: var(--padding);
            gap: 4px;
            justify-content: center;
        }

        #settings-sidebar {
            gap: 0px;
            padding: 0;
        }

        #settings-page-title {
            text-align: center;
            letter-spacing: -0.3px;
            font-size: 16.5px;
        }

        #settings-navigation {
            display: none;
        }

        #settings-navigation.visible-mobile {
            display: flex;
        }
    }
</style>
