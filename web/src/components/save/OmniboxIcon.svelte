<script lang="ts">
    import IconLink from "@tabler/icons-svelte/IconLink.svelte";
    import IconLoader2 from "@tabler/icons-svelte/IconLoader2.svelte";

    type Props = {
        loading: boolean;
    };

    let { loading }: Props = $props();

    let animated = $state(loading);

    /*
        initial spinner state is equal to loading state,
        just so it's animated on init (or not).
        on transition start, it overrides the value
        to start spinning (to prevent zooming in with no spinning).

        then, on transition end, when the spinner is hidden,
        and if loading state is false, the class is removed
        and the spinner doesn't spin in background while being invisible.

        if loading state is true, then it will just stay spinning
        (aka when it's visible and should be spinning).

        the spin on transition start is needed for the whirlpool effect
        of the link icon being sucked into the spinner.

        this may be unnecessarily complicated but i think it looks neat.
    */
</script>

<div id="input-icons" class:loading>
    <div
        class="input-icon spinner-icon"
        class:animated
        ontransitionstart={() => (animated = true)}
        ontransitionend={() => (animated = loading)}
    >
        <IconLoader2 />
    </div>
    <div class="input-icon link-icon">
        <IconLink />
    </div>
</div>

<style>
    #input-icons,
    #input-icons :global(svg),
    .input-icon {
        width: 18px;
        height: 18px;
    }

    #input-icons {
        display: flex;
        position: absolute;
        margin-left: var(--input-padding);
        pointer-events: none;
    }

    :global([dir="rtl"]) #input-icons {
        margin-left: unset;
        margin-right: var(--input-padding);
    }

    #input-icons :global(svg) {
        stroke: var(--gray);
        stroke-width: 2px;
        will-change: transform;
    }

    .input-icon {
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

    .spinner-icon.animated :global(svg) {
        animation: spinner 0.7s infinite linear;
    }

    .loading .link-icon :global(svg) {
        animation: spinner 0.7s linear;
    }

    .loading .link-icon {
        transform: scale(0.4);
        opacity: 0;
    }

    .loading .spinner-icon {
        transform: none;
        opacity: 1;
    }
</style>
