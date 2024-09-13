<script lang="ts">
    import IconLink from "virtual:icons/tabler/link";
    import IconCopy from "virtual:icons/tabler/copy";
    import IconCheck from "virtual:icons/tabler/check";

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
