<script>
    import SettingsCategory from "../../components/settings/SettingsCategory.svelte";
    import SettingsSection from "../../components/settings/SettingsSection.svelte";

    import IconSunHigh from "@tabler/icons-svelte/IconSunHigh.svelte";
    import IconAccessible from "@tabler/icons-svelte/IconAccessible.svelte";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";
    import IconFileSettings from "@tabler/icons-svelte/IconFileSettings.svelte";

    const iconSize = 18;
    const iconStroke = 1.5;
</script>

<div id="settings-page">
    <div id="settings-sidebar">
        <div class="page-title">settings</div>
        <nav id="settings-navigation">
            <SettingsSection sectionTitle="general">
                <SettingsCategory
                    categoryName="appearance"
                    categoryLink="general/appearance"
                    iconColor="blue"
                >
                    <IconSunHigh size={iconSize} stroke={iconStroke} color="var(--primary)" />
                </SettingsCategory>
                <SettingsCategory
                    categoryName="accessibility"
                    categoryLink="general/accessibility"
                    iconColor="blue"
                >
                    <IconAccessible size={iconSize} stroke={iconStroke} color="var(--primary)"/>
                </SettingsCategory>
            </SettingsSection>
            <SettingsSection sectionTitle="save">
                <SettingsCategory
                    categoryName="video"
                    categoryLink="save/video"
                    iconColor="green"
                >
                    <IconMovie size={iconSize} stroke={iconStroke} color="var(--primary)" />
                </SettingsCategory>
                <SettingsCategory
                    categoryName="audio"
                    categoryLink="save/audio"
                    iconColor="green"
                >
                    <IconMusic size={iconSize} stroke={iconStroke} color="var(--primary)"/>
                </SettingsCategory>
                <SettingsCategory
                    categoryName="metadata"
                    categoryLink="save/metadata"
                    iconColor="green"
                >
                    <IconFileSettings size={iconSize} stroke={iconStroke} color="var(--primary)"/>
                </SettingsCategory>
            </SettingsSection>
        </nav>
    </div>

    <main>
        <slot></slot>
    </main>
</div>

<style>
    #settings-sidebar,
    #settings-navigation {
        display: flex;
        flex-direction: column;
    }

    #settings-sidebar {
        width: 250px;
    }

    #settings-page {
        display: grid;
        grid-template-columns: 300px 1fr;
        overflow: hidden;
        padding-left: calc(60px - var(--padding));
        padding-top: calc(60px - var(--padding));
    }

    .page-title {
        font-size: 24px;
        font-weight: 500;
        letter-spacing: -1px;
    }

    #settings-sidebar {
        gap: 24px;
    }

    #settings-navigation {
        gap: 12px;
    }
</style>
