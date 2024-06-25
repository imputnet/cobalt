<script lang="ts">
    import { page } from "$app/stores";

    import SettingsTab from "$components/settings/SettingsTab.svelte";
    import SettingsSection from "$components/settings/SettingsSection.svelte";

    import IconSunHigh from "@tabler/icons-svelte/IconSunHigh.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconFileSettings from "@tabler/icons-svelte/IconFileSettings.svelte";

    import IconChevronLeft from "@tabler/icons-svelte/IconChevronLeft.svelte";

    let screenWidth: number;

    $: currentPageTitle = $page.url.pathname.split("/").at(-1);
    $: stringPageTitle =
        currentPageTitle !== "settings" ? `/ ${currentPageTitle}` : "";

    $: isMobile = screenWidth <= 750;
    $: isHome = $page.url.pathname === `/settings`;
</script>

<svelte:head>
    <title>
        cobalt: settings {stringPageTitle}
    </title>
</svelte:head>

<svelte:window bind:innerWidth={screenWidth} />

<div id="settings-page">
    <div id="settings-sidebar">
        <div id="settings-header" class:back-visible={!isHome && isMobile}>
            {#if isMobile}
                {#if !isHome}
                    <a class="back-button" href="/settings">
                        <IconChevronLeft />
                    </a>
                {/if}
                <h3 id="settings-page-title">
                    settings
                    {#if !isHome}
                        <span class="title-slash"> / </span>
                        {currentPageTitle}
                    {/if}
                </h3>
            {:else}
                <h2 id="settings-page-title">settings</h2>
            {/if}
        </div>
        <nav id="settings-navigation" class:visible-mobile={isMobile && isHome}>
            <SettingsSection sectionTitle="general">
                <SettingsTab
                    tabName="appearance"
                    tabLink="general/appearance"
                    iconColor="blue"
                >
                    <IconSunHigh />
                </SettingsTab>
            </SettingsSection>
            <SettingsSection sectionTitle="save">
                <SettingsTab
                    tabName="video"
                    tabLink="save/video"
                    iconColor="green"
                >
                    <IconMovie />
                </SettingsTab>
                <SettingsTab
                    tabName="audio"
                    tabLink="save/audio"
                    iconColor="green"
                >
                    <IconMusic />
                </SettingsTab>
                <SettingsTab
                    tabName="metadata"
                    tabLink="save/metadata"
                    iconColor="green"
                >
                    <IconFileSettings />
                </SettingsTab>
            </SettingsSection>
        </nav>
    </div>

    <main id="settings-page-content" class:hidden-mobile={isMobile && isHome}>
        <slot></slot>
    </main>
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
        padding-top: var(--settings-padding);
    }

    #settings-page-content {
        display: flex;
        flex-direction: column;
        gap: var(--settings-padding);
        max-width: 600px;
        padding: 0 var(--settings-padding);
        overflow-y: scroll;
    }

    #settings-sidebar,
    #settings-navigation {
        display: flex;
        flex-direction: column;
    }

    #settings-sidebar {
        width: var(--settings-nav-width);
    }

    #settings-sidebar {
        gap: 24px;
    }

    #settings-navigation {
        gap: var(--padding);
    }

    #settings-header {
        --back-padding: calc(var(--padding) / 2);
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
        stroke-width: 2px;
        height: 21px;
        width: 21px;
    }

    .hidden-mobile {
        display: none !important;
    }

    @media screen and (max-width: 750px) {
        #settings-page {
            --settings-nav-width: 100%;
            display: flex;
            flex-direction: column;
            grid-template-columns: 1fr;
            padding: 0;
        }

        #settings-page-content,
        #settings-navigation {
            padding: var(--padding);
        }

        #settings-page-content {
            max-width: unset;
            gap: calc(var(--padding) * 2);
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
        }

        #settings-page-title {
            text-align: center;
            letter-spacing: -0.3px;
        }

        .title-slash {
            color: var(--gray);
        }

        #settings-navigation {
            display: none;
        }

        #settings-navigation.visible-mobile {
            display: flex;
        }
    }
</style>
