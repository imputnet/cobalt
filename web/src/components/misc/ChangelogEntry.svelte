<script lang="ts">
    export let version: string;
    export let title: string;
    export let date: string;
    export let banner: { file: string, alt: string } | undefined;
</script>
<style>
    main {
        padding: 1em;
    }

    img {
        max-width: 100%;
    }

    h1 {
        padding-top: 1em;
    }

    .contents :global(.text-backdrop) {
        border-radius: 4px;
        background-color: var(--button);
        color: var(--background);
        padding: 0.3rem;
    }

    .contents :global(.text-backdrop.link) {
        text-decoration: underline;
    }

    h1 {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    h1 .changelog-version {
        padding: .15rem .5rem;
        border-radius: 4px;
        background-color: var(--button-hover);
    }

    h1 .changelog-title {
        padding: .15rem 0;
        text-align: left;
    }

    .changelog-banner {
        padding: 2em;
        width: 100%;
        max-height: 300pt;
        min-height: 210pt;
        display: block;
        object-fit: cover;
        aspect-ratio: 16/9;
    }

    .changelog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .contents {
        max-width: 100%;
    }

</style>
<main>
    <h1>
        <div class="changelog-version">{ version }</div>
        <div class="changelog-title">{ title }</div>
    </h1>
    <small>{ date }</small>
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
