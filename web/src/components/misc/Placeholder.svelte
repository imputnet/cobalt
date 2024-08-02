<script>
    import Meowbalt from "$components/misc/Meowbalt.svelte";

    export let pageName;
</script>

<div id="placeholder-container" class="center-column-container">
    <Meowbalt emotion="smile" />
    <div tabindex="-1" data-first-focus data-focus-ring-hidden>
        {`${pageName} page is not ready yet!`}
    </div>
</div>

<style>
    #placeholder-container {
        gap: calc(var(--padding) * 2);
        text-align: center;
    }
</style>
