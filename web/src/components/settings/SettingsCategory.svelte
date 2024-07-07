<script lang="ts">
    import { page } from "$app/stores";

    export let sectionId: string;
    export let title: string;
    export let description: string = "";

    let animate = false;

    $: hash = $page.url.hash.replace("#", "");

    $: if (hash === sectionId) {
        animate = true;
    }
</script>

<section
    id={sectionId}
    class="settings-content"
    class:animate
>
    <h3 class="settings-content-title">{title}</h3>
    <slot></slot>

    {#if description.length > 0}
        <div class="settings-content-description subtext">{description}</div>
    {/if}
</section>

<style>
    .settings-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: calc(var(--settings-padding) / 2);
        border-radius: 18px;
    }

    .settings-content.animate {
        animation: highlight 2s;
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

    @media screen and (max-width: 750px) {
        .settings-content {
            padding: var(--padding);
        }
    }
</style>
