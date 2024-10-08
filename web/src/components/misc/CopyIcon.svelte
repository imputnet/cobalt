<script lang="ts">
    import IconLink from "@tabler/icons-svelte/IconLink.svelte";
    import IconCopy from "@tabler/icons-svelte/IconCopy.svelte";
    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";

    export let check = false;
    export let regularIcon = false;
</script>

<div class="copy-animation" class:check>
    <div class="icon-copy">
        {#if regularIcon}
            <IconCopy />
        {:else}
            <IconLink />
        {/if}
    </div>
    <div class="icon-check">
        <IconCheck />
    </div>
</div>

<style>
    .copy-animation {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 24px;
        width: 24px;
    }

    .copy-animation :global(svg) {
        will-change: transform;
    }

    .icon-copy,
    .icon-check {
        display: flex;
        position: absolute;
        transition: transform 0.25s, opacity 0.25s;
    }

    .icon-copy {
        transform: none;
        opacity: 1;
    }

    .icon-check {
        transform: scale(0.4);
        opacity: 0;
    }

    .check .icon-copy {
        transform: scale(0.4);
        opacity: 0;
    }

    .check .icon-check {
        transform: none;
        opacity: 1;
    }
</style>
