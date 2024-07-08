<script lang="ts">
    import { page } from "$app/stores";

    import { t } from "$lib/i18n/translations";

    export let tabName: string;
    export let tabLink: string;

    const firstTabPage = ["save", "settings", "updates"];

    let tab: HTMLElement;

    $: currentTab = $page.url.pathname.split("/")[1];
    $: baseTabPath = tabLink.split("/")[1];

    $: isTabActive = currentTab === baseTabPath;

    const showTab = (e: HTMLElement | undefined) => {
        if (e) {
            e.scrollIntoView({
                inline: firstTabPage.includes(tabName) ? "end" : "start",
                behavior: "smooth",
            });
        }
    };

    $: if (isTabActive) {
        showTab(tab);
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
    }

    .sidebar-tab :global(svg) {
        stroke-width: 1.2px;
        height: 21px;
        width: 21px;
    }

    .sidebar-tab.active {
        color: var(--sidebar-bg);
        background: var(--sidebar-highlight);
        opacity: 1;
    }

    .sidebar-tab:active:not(.active) {
        opacity: 1;
        background-color: var(--sidebar-hover);
    }

    @media (hover: hover) {
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
    }
</style>
