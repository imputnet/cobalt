<script lang="ts">
    export let version: string;
    export let title: string;
    export let date: string;
    export let banner: { file: string, alt: string } | undefined;
</script>
<style>
    img {
        max-width: 100%;
    }

    h1, h2 {
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
</style>
<div>
    <h1>{ version }: { title }</h1>
    <h2>{ date }</h2>
    {#if banner}
        <img src={`/update-banners/${banner.file}`} alt={banner.alt} />
    {/if}
    <div class="contents">
        <slot></slot>
    </div>
</div>