<script>
    import CobaltLogo from "$components/sidebar/CobaltLogo.svelte";
    import SidebarTab from "$components/sidebar/SidebarTab.svelte";

    import IconDownload from "@tabler/icons-svelte/IconDownload.svelte";
    import IconCut from "@tabler/icons-svelte/IconCut.svelte";
    import IconCrop from "@tabler/icons-svelte/IconCrop.svelte";
    import IconTransform from "@tabler/icons-svelte/IconTransform.svelte";
    import IconSettings from "@tabler/icons-svelte/IconSettings.svelte";

    import IconComet from "@tabler/icons-svelte/IconComet.svelte";
    import IconHeart from "@tabler/icons-svelte/IconHeart.svelte";
    import IconInfoCircle from "@tabler/icons-svelte/IconInfoCircle.svelte";

    const iconSize = 21;
    const iconStroke = 1.2;
</script>

<nav id="sidebar">
    <CobaltLogo />
    <div id="sidebar-tabs">
        <div id="sidebar-actions" class="sidebar-inner-container">
            <SidebarTab tabName="save" tabLink="/">
                <IconDownload size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="trim" tabLink="/trim">
                <IconCut size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="crop" tabLink="/crop">
                <IconCrop size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="convert" tabLink="/convert">
                <IconTransform size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="settings" tabLink="/settings">
                <IconSettings size={iconSize} stroke={iconStroke} />
            </SidebarTab>
        </div>
        <div id="sidebar-info" class="sidebar-inner-container">
            <SidebarTab tabName="updates" tabLink="/updates">
                <IconComet size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="donate" tabLink="/donate">
                <IconHeart size={iconSize} stroke={iconStroke} />
            </SidebarTab>
            <SidebarTab tabName="about" tabLink="/about">
                <IconInfoCircle size={iconSize} stroke={iconStroke} />
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
            content: '';
            z-index: 1;
            width: 100%;
            height: 100%;
            display: block;
            position: absolute;
            pointer-events: none;
            background: var(--sidebar-mobile-gradient);
        }

        #sidebar-tabs {
            justify-content: space-around;
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
</style>
