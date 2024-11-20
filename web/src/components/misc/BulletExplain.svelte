<script lang="ts">
    export let title: string;
    export let description: string;
    export let icon: ConstructorOfATypedSvelteComponent;
</script>

<div class="bullet-holder">
    <div class="bullet-icon">
        <svelte:component this={icon} />
    </div>
    <div class="bullet-content">
        <div class="bullet-title">
            {title}
        </div>
        <div class="subtext bullet-description">
            {description}
        </div>
    </div>
</div>

<style>
    .bullet-holder {
        display: flex;
        flex-direction: row;
        text-align: start;
        gap: var(--padding);
    }

    .bullet-content {
        display: flex;
        flex-direction: column;
        gap: calc(var(--padding) / 2);
    }

    .bullet-title {
        color: var(--secondary);
        display: flex;
        flex-direction: row;
        align-items: center;
        font-weight: 500;
        gap: var(--padding);
    }

    .bullet-description {
        padding: 0;
        line-height: 1.5;
        font-size: 13.5px;
    }

    .bullet-icon {
        display: flex;
    }

    .bullet-icon :global(svg) {
        width: 21px;
        height: 21px;
    }

    @media screen and (max-width: 535px) {
        .bullet-content {
            gap: calc(var(--padding) / 2.5);
        }

        .bullet-title {
            font-size: 15px;
        }

        .bullet-description {
            font-size: 13px;
        }

        .bullet-icon :global(svg) {
            width: 19px;
            height: 19px;
        }
    }
</style>
