<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import { device } from "$lib/device";

    import CobaltLogo from "$components/sidebar/CobaltLogo.svelte";
    import SidebarTab from "$components/sidebar/SidebarTab.svelte";

    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";
    import IconSettings from "@tabler/icons-svelte/IconSettings.svelte";

    import IconComet from "@tabler/icons-svelte/IconComet.svelte";
    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
    import IconInfoCircle from "@tabler/icons-svelte/IconInfoCircle.svelte";
    import { defaultSettingsPage } from "$lib/settings/defaults";

    let screenWidth: number;
    let settingsLink = defaultSettingsPage();

    $: screenWidth, settingsLink = defaultSettingsPage();
</script>

<svelte:window bind:innerWidth={screenWidth} />

<nav id="sidebar" aria-label={$t("a11y.tabs.tabPanel")} class:on-iPhone={device.is.iPhone}>
    <CobaltLogo />
    <div id="sidebar-tabs">
        <div id="sidebar-actions" class="sidebar-inner-container">
            <SidebarTab tabName="save" tabLink="/">
                <IconDownload />
            </SidebarTab>
            <SidebarTab tabName="settings" tabLink={settingsLink}>
                <IconSettings />
            </SidebarTab>
        </div>
        <div id="sidebar-info" class="sidebar-inner-container">
            <SidebarTab tabName="updates" tabLink="/updates">
                <IconComet />
            </SidebarTab>
            <SidebarTab tabName="donate" tabLink="/donate">
                <IconHeart />
            </SidebarTab>
            <SidebarTab tabName="about" tabLink="/about">
                <IconInfoCircle />
            </SidebarTab>
        </div>
    </div>
</nav>

<style>
    #sidebar,
    #sidebar-tabs,
    .sidebar-inner-container {
        display: flex;
        flex-direction: column;
    }

    #sidebar {
        background: var(--sidebar-bg);
        height: 100vh;
        width: var(--sidebar-width);
        position: sticky;
        padding: 0 var(--sidebar-inner-padding);
    }

    #sidebar-tabs {
        height: 100%;
        justify-content: space-between;
        padding-bottom: var(--padding);
        overflow-y: scroll;
    }

    @media screen and (max-width: 535px) {
        #sidebar,
        #sidebar-tabs,
        .sidebar-inner-container {
            flex-direction: row;
        }

        #sidebar {
            width: 100%;
            height: var(--sidebar-height-mobile);
            position: fixed;
            bottom: 0;
            padding: var(--sidebar-inner-padding) 0;
            justify-content: center;
        }

        #sidebar::before {
            content: "";
            z-index: 1;
            width: 100%;
            height: 100%;
            display: block;
            position: absolute;
            pointer-events: none;
            background: var(--sidebar-mobile-gradient);
        }

        #sidebar-tabs {
            overflow-y: visible;
            overflow-x: scroll;
            padding-bottom: 0;
        }

        #sidebar :global(.sidebar-inner-container:first-child) {
            padding-left: calc(var(--border-radius) * 2);
        }

        #sidebar :global(.sidebar-inner-container:last-child) {
            padding-right: calc(var(--border-radius) * 2);
        }
    }

    /* add padding for notch / dynamic island in landscape */
    @media screen and (orientation: landscape) {
        #sidebar.on-iPhone {
            padding-left: env(safe-area-inset-left);
        }
    }
</style>
