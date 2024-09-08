<script lang="ts">
    import { page } from "$app/stores";
    import { t } from "$lib/i18n/translations";

    export let title: string;
    export let sectionId: string;

    export let disabled = false;
    export let beta = false;

    let focus = false;

    $: hash = $page.url.hash.replace("#", "");

    $: if (hash === sectionId) {
        focus = true;
    }
</script>

<section
    id={sectionId}
    class="settings-content"
    class:focus
    class:disabled
    aria-hidden={disabled}
>
    <div class="settings-content-header">
        <h3 class="settings-content-title">{title}</h3>
        {#if beta}
            <div class="beta-label">{$t("general.beta")}</div>
        {/if}
    </div>
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

    .settings-content-header {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
    }

    .beta-label {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        padding: 0 5px;
        background: var(--secondary);
        color: var(--primary);
        font-size: 11px;
        font-weight: 500;
        line-height: 0;
        text-transform: uppercase;
    }

    @media screen and (max-width: 750px) {
        .settings-content {
            padding: var(--padding);
        }
    }
</style>
