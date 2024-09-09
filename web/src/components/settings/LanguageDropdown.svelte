<script lang="ts">
    import locale from "$lib/i18n/locale";
    import languages from "$i18n/languages.json";

    import { t, locales } from "$lib/i18n/translations";
    import settings, { updateSetting } from "$lib/state/settings";

    import IconSelector from "@tabler/icons-svelte/IconSelector.svelte";

    $: currentSetting = $settings.appearance.language;
    $: disabled = $settings.appearance.autoLanguage;

    const updateLocale = (lang: string) => {
        updateSetting({
            appearance: {
                language: lang as keyof typeof languages,
            },
        });
    };
</script>

<div class="language-selector-parent" class:disabled aria-hidden={disabled}>
    <div id="language-selector" class="selector button">
        <div class="selector-info">
            <h4 class="selector-title">
                {$t("settings.language.preferred.title")}
            </h4>
            <div class="right-side">
                <span class="selector-current" aria-hidden="true">
                    {$t(`languages.${currentSetting}`)}
                </span>
                <IconSelector />
            </div>
        </div>
        <select
            id="setting-dropdown-appearance-language"
            bind:value={$locale}
            on:change={() => updateLocale($locale)}
            {disabled}
        >
            {#each $locales as value}
                <option {value} selected={currentSetting === value}>
                    {$t(`languages.${value}`)}
                </option>
            {/each}
        </select>
    </div>
    <div class="subtext toggle-description">
        {$t("settings.language.preferred.description")}
    </div>
</div>

<style>
    .language-selector-parent {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: hidden;
        transition: opacity 0.2s;
    }

    .language-selector-parent.disabled {
        opacity: 0.5;
    }

    #language-selector {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        position: relative;

        padding: calc(var(--switcher-padding) * 2) 16px;

        pointer-events: all;
        overflow: scroll;
    }

    .disabled #language-selector {
        pointer-events: none;
    }

    .selector-info {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        gap: var(--padding);
        min-height: 26px;

        z-index: 2;
        pointer-events: none;
    }

    .right-side {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        float: right;
        gap: calc(var(--padding) / 2);
    }

    .selector-current,
    .selector select {
        font-size: 13px;
        font-weight: 400;
    }

    .right-side :global(svg) {
        stroke-width: 1.5px;
        height: 20px;
        width: 20px;
        stroke: var(--secondary);
    }

    .selector select {
        position: absolute;
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        left: 0;
        border-radius: var(--border-radius);
        cursor: pointer;
        color: transparent;
        text-align: right;

        /* safari fix */
        appearance: initial;
        text-align-last: right;
    }

    /* fix for chrome on windows */
    option {
        color: initial;
        text-align: initial;
        text-align-last: initial;
        border-radius: initial;
        background: initial;
        border: initial;
    }

    @media (hover: hover) {
        .selector:hover {
            background-color: var(--button-hover);
        }
    }
</style>
