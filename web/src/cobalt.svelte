<script>
    import '@fontsource-variable/noto-sans-mono';
    import '@fontsource/redaction-10';

    import HomeBanner from "./components/HomeBanner/HomeBanner.svelte";
    import Pager from "./components/Pager/Pager.svelte";
</script>
<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
    :global(*) {
        font-family: 'Noto Sans Mono', monospace;
        font-weight: 500;
    }
</style>
<main>
    <HomeBanner />
    <Pager />
</main>
