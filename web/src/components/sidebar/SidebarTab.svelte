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
    <span class="tab-title">{$t(`tabs.${name}`)}</span>
</a>

<style>
    .sidebar-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        padding: var(--sidebar-tab-padding) 4px;
        color: var(--sidebar-highlight);
        font-size: var(--sidebar-font-size);
        opacity: 0.7;
        height: fit-content;
        border-radius: var(--border-radius);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        text-decoration: none;
        text-decoration-line: none;
        position: relative;
        scroll-behavior: smooth;

        cursor: pointer;
        background: transparent;
        border: 1px solid transparent;
    }

    .sidebar-tab :global(svg) {
        stroke-width: 1.3px;
        height: 22px;
        width: 22px;
        transition: transform 0.2s ease;
    }

    :global([data-iphone="true"] .sidebar-tab svg) {
        will-change: transform;
    }

    .sidebar-tab.active {
        color: var(--primary);
        background: var(--gradient-orange);
        opacity: 1;
        transform: none;
        transition: none;
        animation: pressButton 0.3s;
        cursor: default;
        box-shadow: 0 0 24px rgba(249, 115, 22, 0.5), 0 4px 12px rgba(249, 115, 22, 0.3);
        border-color: transparent;
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
        opacity: 0.8;
        color: var(--orange);
        font-weight: 600;
    }

    .tab-title {
        white-space: nowrap;
    }

    .sidebar-tab:active:not(.active) {
        opacity: 1;
    }

    @keyframes pressButton {
        0% {
            transform: scale(0.9);
        }
        50% {
            transform: scale(1.02);
        }
        100% {
            transform: scale(1);
        }
    }

    @media (hover: hover) {
        .sidebar-tab:hover:not(.active) {
            background: var(--glass-bg-light);
            border-color: var(--glass-border-light);
            box-shadow: 0 0 16px rgba(249, 115, 22, 0.15);
        }

        .sidebar-tab:hover:not(.active) :global(svg) {
            transform: scale(1.1);
        }

        .sidebar-tab:active:not(.active),
        .sidebar-tab:focus:hover:not(.active) {
            background: var(--button-press-transparent);
            border-color: rgba(249, 115, 22, 0.3);
        }

        .sidebar-tab:hover:not(.active) {
            opacity: 1;
        }

        .sidebar-tab:active:not(.active),
        .sidebar-tab:focus:hover:not(.active) {
            opacity: 1;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
        }
    }

    @media screen and (max-width: 535px) {
        .sidebar-tab {
            padding: 6px var(--padding);
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
