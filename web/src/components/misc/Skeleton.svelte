<script lang="ts">
    export let width: string | undefined = undefined;
    export let height: string | undefined = undefined;
    export let hidden: boolean | undefined = undefined;

    let _class = '';
    export { _class as class };

    $: style = [
        width && `width: ${width}`,
        height && `height: ${height}`,
        hidden && `display: none`
    ].filter(a => a).join(';');
</script>

<div
    class="skeleton {_class}"
    {style}
    {...$$restProps}
></div>

<style>
    .skeleton {
        border-radius: var(--border-radius);
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
    }

    :global([data-theme=light]) .skeleton {
        background-color: var(--button-hover);
    }

    .skeleton.big {
        background-size: 700px 100%;
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
            background-position: -700px 0;
        }
        100% {
            background-position: calc(700px + 100%) 0;
        }
    }
</style>