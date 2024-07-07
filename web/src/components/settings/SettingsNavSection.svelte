<script lang="ts">
    import { t } from "$lib/i18n/translations";

    export let sectionTitle: string;
</script>

<div id="settings-section">
    <div id="settings-section-title">{$t(`settings.section.${sectionTitle}`)}</div>
    <div id="settings-section-categories">
        <slot></slot>
    </div>
</div>

<style>
    #settings-section,
    #settings-section-categories {
        display: flex;
        flex-direction: column;
    }

    #settings-section {
        gap: 6px;
    }

    #settings-section-title {
        font-size: 12px;
        color: var(--gray);
        padding-left: 8px;
    }

    @media screen and (max-width: 750px) {
        #settings-section-categories {
            background: var(--button);
            border-radius: var(--border-radius);
            box-shadow: var(--button-box-shadow);
        }

        #settings-section-title {
            padding-left: calc(7px * 1.5);
        }
    }
</style>
