<script lang="ts">
    import IconBlender from "@tabler/icons-svelte/IconBlender.svelte";

    export let indeterminate = false;
    export let progress: number = 0;
    export let expandAction: () => void;

    $: progressStroke = `${progress}, 100`;
    const indeterminateStroke = "15, 5";
</script>

<button
    id="processing-status"
    on:click={expandAction}
    class:completed={progress >= 100}
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
        <IconBlender />
    </div>
</button>

<style>
    #processing-status {
        --processing-status-glow: 0 0 8px 0px var(--button-elevated-hover);

        pointer-events: all;
        padding: 7px;
        border-radius: 30px;
        box-shadow:
            var(--button-box-shadow),
            var(--processing-status-glow);

        transition: box-shadow 0.2s, background-color 0.2s;
    }

    #processing-status.completed {
        box-shadow:
            0 0 0 2px var(--blue) inset,
            var(--processing-status-glow);
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
        animation: spin 3s linear infinite;
    }

    #progress-ring.indeterminate circle {
        transition: none;
    }

    .completed #progress-ring {
        opacity: 0;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
