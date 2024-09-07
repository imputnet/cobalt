<script lang="ts">
    import { page } from "$app/stores";

    import { t } from "$lib/i18n/translations";

    export let tabName: string;
    export let tabLink: string;
    export let beta = false;

    const firstTabPage = ["save", "remux", "settings"];

    let tab: HTMLElement;

    $: currentTab = $page.url.pathname.split("/")[1];
    $: baseTabPath = tabLink.split("/")[1];

    $: isTabActive = currentTab === baseTabPath;

    const showTab = (e: HTMLElement) => {
        if (e) {
            e.scrollIntoView({
                inline: firstTabPage.includes(tabName) ? "end" : "start",
                block: "nearest",
                behavior: "smooth",
            });
        }
    };

    $: if (isTabActive && tab) {
        showTab(tab);

        tab.classList.add("animate");
        setTimeout(() => {
            tab.classList.remove("animate");
        }, 250);
    }
</script>

<a
    id="sidebar-tab-{tabName}"
    class="sidebar-tab"
    class:active={isTabActive}
    href={tabLink}
    bind:this={tab}
    on:focus={() => showTab(tab)}
    role="tab"
    aria-selected={isTabActive}
>
    {#if beta}
        <div class="beta-sign" aria-label={$t("general.beta")}>β</div>
    {/if}
    <slot></slot>
    {$t(`tabs.${tabName}`)}
</a>

<style>
    .sidebar-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 5px;
        padding: var(--padding) 5px;
        color: var(--sidebar-highlight);
        font-size: var(--sidebar-font-size);
        opacity: 0.8;
        height: fit-content;
        border-radius: var(--border-radius);
        transition: transform 0.2s;

        text-decoration: none;
        text-decoration-line: none;
        position: relative;
        scroll-behavior: smooth;
    }

    .sidebar-tab :global(svg) {
        stroke-width: 1.2px;
        height: 21px;
        width: 21px;
    }

    :global([data-iphone="true"] .sidebar-tab svg) {
        will-change: transform;
    }

    .sidebar-tab.active {
        color: var(--sidebar-bg);
        background: var(--sidebar-highlight);
        opacity: 1;
        transition: none;
        transform: none;
    }

    :global(.sidebar-tab.animate) {
        animation: pressButton 0.2s;
    }

    .sidebar-tab:active:not(.active) {
        transform: scale(0.95);
    }

    :global([data-reduce-motion="true"]) .sidebar-tab:active:not(.active) {
        transform: none;
    }

    .beta-sign {
        position: absolute;
        transform: translateX(16px) translateY(-6px);
        opacity: 0.7;
    }

    @keyframes pressButton {
        0% {
            transform: scale(0.95);
        }
        50% {
            transform: scale(1.02);
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
                transform: scale(0.9);
            }
            60% {
                transform: scale(1.015);
            }
            100% {
                transform: scale(1);
            }
        }
    }
</style>
