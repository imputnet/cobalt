<script>
    import CobaltLogo from "./CobaltLogo.svelte";
    import SidebarTab from "./SidebarTab.svelte";

    import IconDownload from '@tabler/icons-svelte/IconDownload.svelte';
    import IconCut from '@tabler/icons-svelte/IconCut.svelte';
    import IconCrop from '@tabler/icons-svelte/IconCrop.svelte';
    import IconTransform from '@tabler/icons-svelte/IconTransform.svelte';
    import IconSettings from '@tabler/icons-svelte/IconSettings.svelte';

    import IconComet from '@tabler/icons-svelte/IconComet.svelte';
    import IconHeart from '@tabler/icons-svelte/IconHeart.svelte';
    import IconInfoCircle from '@tabler/icons-svelte/IconInfoCircle.svelte';

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
        background: var(--secondary);
        height: 100vh;
        width: var(--sidebar-width);
        position: sticky;
        scrollbar-width: none;
    }

    #sidebar-tabs {
        height: 100%;
        justify-content: space-between;
        padding-bottom: var(--padding);
        overflow: scroll;
        scrollbar-width: none;
    }

    @media screen and (max-width: 535px) {
        #sidebar,
        #sidebar-tabs,
        .sidebar-inner-container {
            flex-direction: row;
        }
        #sidebar {
            width: 100%;
            height: auto;
            overflow: scroll;
            position: fixed;
            bottom: 0;
        }
        #sidebar::before {
            content: '';
            z-index: 1;
            width: 100%;
            height: 100%;
            display: block;
            position: absolute;
            pointer-events: none;
            background: linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.9) 0%,
                rgba(0, 0, 0, 0) 4%,
                rgba(0, 0, 0, 0) 50%,
                rgba(0, 0, 0, 0) 96%,
                rgba(0, 0, 0, 0.9) 100%
            );
        }
        #sidebar-tabs {
            justify-content: space-around;
            padding-bottom: 0;
        }
    }
</style>
