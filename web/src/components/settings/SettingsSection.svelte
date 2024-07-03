<script lang="ts">
    export let sectionTitle: string;
</script>

<section id="settings-section">
    <div id="settings-section-title">{sectionTitle}</div>
    <div id="settings-section-categories">
        <slot></slot>
    </div>
</section>

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
