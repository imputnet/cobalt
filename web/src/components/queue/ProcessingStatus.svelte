<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import IconArrowDown from "@tabler/icons-svelte/IconArrowDown.svelte";

    type Props = {
        indeterminate?: boolean;
        progress?: number;
        expandAction: () => void;
    }

    let {
        indeterminate = false,
        progress = $bindable(0),
        expandAction
    }: Props = $props();

    let progressStroke = $derived(`${progress}, 100`);
    const indeterminateStroke = "15, 5";

    let ariaState = $derived(
        progress > 0 && progress < 100
        ? "ongoing"
        : progress >= 100
            ? "completed"
            : "default"
    )
</script>

<button
    id="processing-status"
    onclick={expandAction}
    class="button"
    class:completed={progress >= 100}
    aria-label={$t(`a11y.queue.status.${ariaState}`)}
>
    <svg
        id="progress-ring"
        class:indeterminate
        class:progressive={progress > 0 && !indeterminate}
    >
        <circle
            cx="19"
            cy="19"
            r="16"
            fill="none"
            stroke-dasharray={indeterminate
                ? indeterminateStroke
                : progressStroke}
        />
    </svg>
    <div class="icon-holder">
        <IconArrowDown />
    </div>
</button>

<style>
    #processing-status {
        pointer-events: all;
        padding: 7px;
        border-radius: 30px;

        filter: drop-shadow(0 0 3px var(--button-elevated-hover));

        transition:
            background-color 0.2s,
            transform 0.2s;

        will-change: transform, background-color;
    }

    #processing-status:focus-visible {
        outline: 2px solid var(--secondary);
        outline-offset: 2px;
    }

    #processing-status:active {
        transform: scale(0.9);
    }

    #processing-status.completed {
        box-shadow: 0 0 0 2px var(--blue) inset;
    }

    :global([data-theme="light"]) #processing-status.completed {
        background-color: #e0eeff;
    }

    :global([data-theme="dark"]) #processing-status.completed {
        background-color: #1f3249;
    }

    .icon-holder {
        display: flex;
        background-color: var(--button-elevated-hover);
        padding: 2px;
        border-radius: 20px;
        transition: background-color 0.2s;
    }

    .icon-holder :global(svg) {
        height: 21px;
        width: 21px;
        stroke: var(--secondary);
        stroke-width: 1.5px;
        transition: stroke 0.2s;
    }

    .completed .icon-holder {
        background-color: var(--blue);
    }

    .completed .icon-holder :global(svg) {
        stroke: white;
    }

    #progress-ring {
        position: absolute;
        transform: rotate(-90deg);
        width: 38px;
        height: 38px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    #progress-ring circle {
        stroke: var(--blue);
        stroke-width: 4;
        stroke-dashoffset: 0;
    }

    #progress-ring.progressive circle {
        transition: stroke-dasharray 0.2s;
    }

    #progress-ring.progressive,
    #progress-ring.indeterminate {
        opacity: 1;
    }

    #progress-ring.indeterminate {
        animation: spinner 3s linear infinite;
        will-change: transform;
    }

    #progress-ring.indeterminate circle {
        transition: none;
    }

    .completed #progress-ring {
        opacity: 0;
    }
</style>
