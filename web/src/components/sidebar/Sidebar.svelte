<script>
    import CobaltLogo from "./CobaltLogo.svelte";
    import SidebarTab from "./SidebarTab.svelte";

    import {
        IconDownload,
        IconCut,
        IconCrop,
        IconTransform,
        IconSettings,
        IconComet,
        IconHeart,
        IconInfoCircle,
    } from "@tabler/icons-svelte";

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
        background: black;
        height: 100vh;
        position: sticky;
        width: var(--sidebar-width);
    }

    #sidebar-tabs {
        height: 100%;
        justify-content: space-between;
        padding-bottom: var(--sidebar-padding);
    }
</style>
