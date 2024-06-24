<script lang="ts">
    export let sectionTitle: string;
</script>

<div id="settings-section">
    <div id="settings-section-title">{sectionTitle}</div>
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
</style>
