<script>
    import MeowbaltLoaf from "$components/meowbalt/MeowbaltLoaf.svelte";
    export let pageName;
</script>

<div id="placeholder-container" class="center-column-container">
    <MeowbaltLoaf />
    <div>{pageName} page is not ready yet!</div>
</div>

<style>
    #placeholder-container {
        gap: calc(var(--padding) * 2);
        text-align: center;
    }
</style>
