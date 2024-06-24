<script>
    import SettingsTab from "$components/settings/SettingsTab.svelte";
    import SettingsSection from "$components/settings/SettingsSection.svelte";

    import IconSunHigh from "@tabler/icons-svelte/IconSunHigh.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconFileSettings from "@tabler/icons-svelte/IconFileSettings.svelte";
</script>

<div id="settings-page">
    <div id="settings-sidebar">
        <h2 id="settings-page-title">settings</h2>
        <nav id="settings-navigation">
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

    <main id="settings-page-content">
        <slot></slot>
    </main>
</div>

<style>
    #settings-page {
        --settings-nav-width: 250px;
        --settings-padding: 30px;
        display: grid;
        width: 100%;
        grid-template-columns: var(--settings-nav-width) 1fr;
        overflow: hidden;
        padding-left: calc(var(--settings-padding) - var(--padding));
        padding-top: calc(var(--settings-padding) - var(--padding));
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
        gap: 12px;
    }
</style>
