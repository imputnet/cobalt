<script lang="ts">
    import settings from "$lib/state/settings";
    import { device } from "$lib/device";
    import { locale } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    export let title: string;
    export let description: string;

    const updateLocale = () => {
        if ($settings.appearance.autoLanguage) {
            $locale = device.prefers.language;
        } else {
            $locale = $settings.appearance.language;
        }
    }

    $: $settings.appearance.autoLanguage, updateLocale();
</script>

<SettingsToggle
    settingContext="appearance"
    settingId="autoLanguage"
    {title}
    {description}
/>
