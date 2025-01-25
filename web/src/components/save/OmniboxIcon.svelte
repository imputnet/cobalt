<script lang="ts">
    import IconLink from "@tabler/icons-svelte/IconLink.svelte";
    import IconLoader2 from "@tabler/icons-svelte/IconLoader2.svelte";

    export let loading: boolean;
</script>

<div id="input-icons" class:loading>
    <div class="input-icon spinner-icon">
        <IconLoader2 />
    </div>
    <div class="input-icon link-icon">
        <IconLink />
    </div>
</div>

<style>
    #input-icons {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
    }

    #input-icons :global(svg) {
        stroke: var(--gray);
        width: 18px;
        height: 18px;
        stroke-width: 2px;
    }

    .input-icon {
        display: flex;
        position: absolute;
        transition:
            transform 0.25s,
            opacity 0.25s;
    }

    .link-icon {
        transform: none;
        opacity: 1;
    }

    .spinner-icon {
        transform: scale(0.4);
        opacity: 0;
    }

    .spinner-icon :global(svg) {
        animation: spin 0.7s infinite linear;
    }

    .loading .link-icon :global(svg) {
        animation: spin 0.7s infinite linear;
    }

    .loading .link-icon {
        transform: scale(0.4);
        opacity: 0;
    }

    .loading .spinner-icon {
        transform: none;
        opacity: 1;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
