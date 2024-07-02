<script lang="ts">
    import settings, { updateSetting } from "$lib/settings";
    import { t, locale, locales } from "$lib/i18n/translations";

    import languages from "$i18n/languages.json";

    $: currentSetting = $settings.appearance.language;

    const updateLocale = (lang: string) => {
        updateSetting({
            appearance: {
                language: lang as keyof typeof languages,
            },
        })
    }
</script>

<select
    id="setting-dropdown-appearance-language"
    bind:value={$locale}
    on:change={() => updateLocale($locale)}
>
    {#each $locales as value}
        <option value={value} selected={currentSetting === value}>
            {$t(`languages.${value}`)}
        </option>
    {/each}
</select>
