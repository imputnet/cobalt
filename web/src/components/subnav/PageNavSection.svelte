<script lang="ts">
    export let sectionTitle: string = "";
</script>

<div id="subnav-section">
    {#if sectionTitle}
        <div id="subnav-section-title">
            {sectionTitle}
        </div>
    {/if}
    <div id="subnav-section-categories">
        <slot></slot>
    </div>
</div>

<style>
    #subnav-section,
    #subnav-section-categories {
        display: flex;
        flex-direction: column;
    }

    #subnav-section {
        gap: 6px;
        border-radius: var(--border-radius);
    }

    #subnav-section-title {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--gray);
        padding-left: 8px;
    }

    @media screen and (max-width: 750px) {
        #subnav-section-categories {
            background: var(--button);
            border-radius: var(--border-radius);
            box-shadow: var(--button-box-shadow);
            overflow-x: hidden;
        }

        #subnav-section-title {
            padding-left: calc(7px * 1.5);
        }
    }
</style>
