<script lang="ts">
    import settings from "$lib/settings";
    import { device } from "$lib/device";
    import { locale, locales } from "$lib/i18n/translations";

    import SettingsToggle from "$components/buttons/SettingsToggle.svelte";

    export let title: string;
    export let description: string;

    const updateLocale = () => {
        if ($settings.appearance.autoLanguage) {
            if ($locales.includes(device.preferredLocale)) {
                $locale = device.preferredLocale;
            }
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
