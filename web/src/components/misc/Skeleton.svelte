<script lang="ts">
    import type { Optional } from "$lib/types/generic";

    export let width: Optional<string> = undefined;
    export let height: Optional<string> = undefined;
    export let hidden: Optional<boolean> = undefined;

    let _class = '';
    export { _class as class };

    $: style = [
        width && `width: ${width}`,
        height && `height: ${height}`
    ].filter(a => a).join(';');
</script>

{#if hidden !== true}
<div
    class="skeleton {_class}"
    {style}
    {...$$restProps}
></div>
{/if}

<style>
    .skeleton {
        border-radius: calc(var(--border-radius) / 2);
        background-color: var(--button);
        background-image: var(--skeleton-gradient);
        background-size: 200px 100%;
        background-repeat: no-repeat;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        animation: skeleton 1.2s ease-in-out infinite;
        line-height: 1;
        font-size: 1em;
        text-align: center;
        pointer-events: none;
    }

    :global([data-theme=light]) .skeleton {
        background-color: var(--button-hover);
    }

    .skeleton.elevated {
        background-image: var(--skeleton-gradient-elevated);
        background-color: var(--button-elevated);
    }

    :global([data-reduce-motion="true"]) .skeleton {
        background-image: none;
    }

    .skeleton.big {
        border-radius: var(--border-radius);
        background-size: 400px 100%;
        animation: skeleton-big 1.2s ease-in-out infinite;
    }

    @keyframes skeleton {
        0% {
            background-position: -200px 0;
        }
        100% {
            background-position: calc(200px + 100%) 0;
        }
    }

    @keyframes skeleton-big {
        0% {
            background-position: -400px 0;
        }
        100% {
            background-position: calc(400px + 100%) 0;
        }
    }
</style>