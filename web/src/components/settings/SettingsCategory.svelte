<script lang="ts">
    import { page } from "$app/stores";
    import { copyURL as _copyURL } from "$lib/download";

    import SectionHeading from "$components/misc/SectionHeading.svelte";

    export let title: string;
    export let sectionId: string;

    export let disabled = false;
    export let beta = false;

    let focus = false;
    let copied = false;

    $: hash = $page.url.hash.replace("#", "");

    $: if (hash === sectionId) {
        focus = true;
    }

    $: if (copied) {
        setTimeout(() => {
            copied = false;
        }, 1500);
    }
</script>

<section
    id={sectionId}
    class="settings-content"
    class:focus
    class:disabled
    aria-hidden={disabled}
>
    <SectionHeading {title} {sectionId} {beta} />
    <slot></slot>
</section>

<style>
    .settings-content {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
        padding: calc(var(--subnav-padding) / 2);
        border-radius: 18px;
        transition: opacity 0.2s;
    }

    .settings-content.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .settings-content.focus {
        animation: highlight 2s;
    }

    :global([data-reduce-motion="true"]) .settings-content.focus {
        animation: highlight-lite 2s !important;
    }

    @keyframes highlight {
        0% {
            box-shadow: none;
        }
        10% {
            box-shadow: 0 0 0 3.5px var(--blue) inset;
        }
        20%, 50% {
            box-shadow: 0 0 0 3px var(--blue) inset;
        }
        100% {
            box-shadow: none;
        }
    }

    @keyframes highlight-lite {
        0% {
            box-shadow: none;
        }
        10%, 50% {
            box-shadow: 0 0 0 3px var(--blue) inset;
        }
        100% {
            box-shadow: none;
        }
    }

    @media screen and (max-width: 750px) {
        .settings-content {
            padding: var(--padding);
        }
    }
</style>
