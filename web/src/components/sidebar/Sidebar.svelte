<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { defaultNavPage } from "$lib/subnav";

    import CobaltLogo from "$components/sidebar/CobaltLogo.svelte";
    import SidebarTab from "$components/sidebar/SidebarTab.svelte";

    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";
    import IconSettings from "@tabler/icons-svelte/IconSettings.svelte";

    import IconRepeat from "@tabler/icons-svelte/IconRepeat.svelte";

    import IconComet from "@tabler/icons-svelte/IconComet.svelte";
    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
    import IconInfoCircle from "@tabler/icons-svelte/IconInfoCircle.svelte";

    let screenWidth: number;
    let settingsLink = defaultNavPage("settings");
    let aboutLink = defaultNavPage("about");

    $: screenWidth,
       settingsLink = defaultNavPage("settings"),
       aboutLink = defaultNavPage("about");
</script>

<svelte:window bind:innerWidth={screenWidth} />

<nav id="sidebar" aria-label={$t("a11y.tabs.tab_panel")}>
    <CobaltLogo />
    <div id="sidebar-tabs" role="tablist">
        <div id="sidebar-actions" class="sidebar-inner-container">
            <SidebarTab tabName="save" tabLink="/">
                <IconDownload />
            </SidebarTab>
            <SidebarTab tabName="remux" tabLink="/remux" beta>
                <IconRepeat />
            </SidebarTab>
        </div>
        <div id="sidebar-info" class="sidebar-inner-container">
            <SidebarTab tabName="settings" tabLink={settingsLink}>
                <IconSettings />
            </SidebarTab>
            <SidebarTab tabName="donate" tabLink="/donate">
                <IconHeart />
            </SidebarTab>
            <SidebarTab tabName="updates" tabLink="/updates">
                <IconComet />
            </SidebarTab>
            <SidebarTab tabName="about" tabLink={aboutLink}>
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
        width: calc(var(--sidebar-width) + var(--sidebar-inner-padding) * 2);
        position: sticky;
    }

    #sidebar-tabs {
        height: 100%;
        width: var(--sidebar-width);
        justify-content: space-between;
        padding: var(--sidebar-inner-padding);
        padding-bottom: var(--border-radius);
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
            justify-content: center;
            align-items: flex-start;
            z-index: 3;
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
            padding: var(--sidebar-inner-padding) 0;
            width: unset;
            height: fit-content;
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
        :global([data-iphone="true"]) #sidebar {
            padding-left: env(safe-area-inset-left);
        }
    }
</style>
