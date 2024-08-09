<script lang="ts">
    import { onMount } from "svelte";

    import CobaltSticker from "$components/icons/CobaltSticker.svelte";

    // please add a source link (https://github.com/imputnet/cobalt) if you use this implementation
    // i spent 4 hours switching between simulators and devices to get the best way to do this

    $: safeAreaTop = 0;
    $: state = "hidden"; // "notch", "island", "notch x"

    const islandValues = [
        59, // regular & plus: default
        48, // regular: larger text
        51, // plus only: larger text
    ];

    const xNotch = [44];

    const getSafeAreaTop = () => {
        const root = document.documentElement;
        return getComputedStyle(root)
            .getPropertyValue("--safe-area-inset-top")
            .trim();
    };

    onMount(() => {
        safeAreaTop = Number(getSafeAreaTop().replace("px", ""));
    });

    $: if (safeAreaTop > 20) {
        state = "notch";
        if (islandValues.includes(safeAreaTop)) {
            state = "island";
        }
        if (xNotch.includes(safeAreaTop)) {
            state = "notch x";
        }
    }
</script>

{#if state !== "hidden"}
    <div id="cobalt-notch-sticker" aria-hidden="true" class={state}>
        <CobaltSticker />
    </div>
{/if}

<style>
    #cobalt-notch-sticker {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 999;
    }

    #cobalt-notch-sticker.island {
        padding-top: 15px;
    }

    #cobalt-notch-sticker.notch {
        padding-top: 2px;
    }

    #cobalt-notch-sticker.notch.x :global(svg) {
        height: 28px;
    }

    #cobalt-notch-sticker :global(svg) {
        width: 100px;
        height: 30px;
    }

    /* regular iphone size, larger text display mode */
    @media screen and (max-width: 350px) {
        #cobalt-notch-sticker.notch :global(svg) {
            height: 24px;
        }

        #cobalt-notch-sticker.island {
            padding-top: 9px;
        }
    }

    /* plus iphone size, dynamic island, larger text display mode */
    @media screen and (max-width: 375px) {
        #cobalt-notch-sticker.island {
            padding-top: 11px;
        }
    }

    @media screen and (orientation: landscape) {
        #cobalt-notch-sticker {
            display: none;
        }
    }
</style>
