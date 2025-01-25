<script lang="ts">
    import { page } from "$app/stores";

    import { t } from "$lib/i18n/translations";

    export let name: string;
    export let path: string;
    export let icon: ConstructorOfATypedSvelteComponent;

    export let beta = false;

    const firstTabPage = ["save", "remux", "settings"];

    let tab: HTMLElement;

    $: currentTab = $page.url.pathname.split("/")[1];
    $: baseTabPath = path.split("/")[1];

    $: isTabActive = currentTab === baseTabPath;

    const showTab = (e: HTMLElement) => {
        if (e) {
            e.scrollIntoView({
                inline: firstTabPage.includes(name) ? "end" : "start",
                block: "nearest",
                behavior: "smooth",
            });
        }
    };

    $: if (isTabActive && tab) {
        showTab(tab);
    }
</script>

<a
    id="sidebar-tab-{name}"
    class="sidebar-tab"
    class:active={isTabActive}
    href={path}
    bind:this={tab}
    on:focus={() => showTab(tab)}
    role="tab"
    aria-selected={isTabActive}
>
    {#if beta}
        <div class="beta-sign" aria-label={$t("general.beta")}>β</div>
    {/if}

    <svelte:component this={icon} />
    {$t(`tabs.${name}`)}
</a>

<style>
    .sidebar-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 3px;
        padding: var(--padding) 3px;
        color: var(--sidebar-highlight);
        font-size: var(--sidebar-font-size);
        opacity: 0.75;
        height: fit-content;
        border-radius: var(--border-radius);
        transition: transform 0.2s;

        text-decoration: none;
        text-decoration-line: none;
        position: relative;
        scroll-behavior: smooth;

        cursor: pointer;
    }

    .sidebar-tab :global(svg) {
        stroke-width: 1.2px;
        height: 22px;
        width: 22px;
    }

    :global([data-iphone="true"] .sidebar-tab svg) {
        will-change: transform;
    }

    .sidebar-tab.active {
        color: var(--sidebar-bg);
        background: var(--sidebar-highlight);
        opacity: 1;
        transform: none;
        transition: none;
        animation: pressButton 0.3s;
        cursor: default;
    }

    .sidebar-tab:not(.active):active {
        transform: scale(0.95);
    }

    :global([data-reduce-motion="true"]) .sidebar-tab:active {
        transform: none;
    }

    .beta-sign {
        position: absolute;
        transform: translateX(16px) translateY(-6px);
        opacity: 0.7;
    }

    @keyframes pressButton {
        0% {
            transform: scale(0.9);
        }
        50% {
            transform: scale(1.015);
        }
        100% {
            transform: scale(1);
        }
    }

    @media (hover: hover) {
        .sidebar-tab:active:not(.active) {
            opacity: 1;
            background-color: var(--sidebar-hover);
        }

        .sidebar-tab:hover:not(.active) {
            opacity: 1;
            background-color: var(--sidebar-hover);
        }
    }

    @media screen and (max-width: 535px) {
        .sidebar-tab {
            padding: 5px var(--padding);
            min-width: calc(var(--sidebar-width) / 2);
        }

        .sidebar-tab.active {
            z-index: 2;
        }

        .sidebar-tab:active:not(.active) {
            transform: scale(0.9);
        }

        @keyframes pressButton {
            0% {
                transform: scale(0.8);
            }
            50% {
                transform: scale(1.02);
            }
            100% {
                transform: scale(1);
            }
        }
    }
</style>
