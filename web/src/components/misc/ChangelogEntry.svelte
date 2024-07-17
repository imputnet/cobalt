<script lang="ts">
    export let version: string;
    export let title: string;
    export let date: string;
    export let banner: { file: string; alt: string } | undefined;
</script>

<main>
    <div id="changelog-header">
        <div class="changelog-info">
            <div class="changelog-version">{version}</div>
            <div class="changelog-date">{date}</div>
        </div>
        <h1 class="changelog-title">{title}</h1>
    </div>
    <div class="changelog-content">
        {#if banner}
            <img
                src={`/update-banners/${banner.file}`}
                alt={banner.alt}
                class="changelog-banner"
            />
        {/if}
        <div class="contents">
            <slot></slot>
        </div>
    </div>
</main>

<style>
    main {
        overflow-x: hidden;
    }

    #changelog-header {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: calc(var(--padding) / 2);
        padding: 1em 0; /* match default <p> padding */
    }

    .changelog-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 14px;
    }

    .changelog-version {
        padding: 3px 8px;
        border-radius: 6px;
        background-color: var(--secondary);
        color: var(--primary);
        font-size: 21px;
        font-weight: 500;
    }

    .changelog-date {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray);
    }

    .changelog-title {
        padding: 0;
        line-height: 1.2;
    }

    .changelog-banner {
        display: block;
        object-fit: cover;
        max-height: 320pt;
        min-height: 210pt;
        width: 100%;
        max-width: 100;
        aspect-ratio: 16/9;
        border-radius: var(--padding);
    }

    .changelog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .contents {
        max-width: 100%;
        line-height: 1.5;
        font-size: 15px;
    }
</style>
