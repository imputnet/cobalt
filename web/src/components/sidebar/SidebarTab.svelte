<script lang="ts">
    import { page } from "$app/stores";

    export let tabName: string;
    export let tabLink: string;

    const firstTabs = [
        "save",
        "trim",
        "crop",
        "convert"
    ];

    let tab: HTMLElement;

    $: currentTab = $page.url.pathname.split('/')[1];
    $: baseTabPath = tabLink.split('/')[1]

    $: isTabActive = currentTab === baseTabPath;

    const showTab = (e: HTMLElement | undefined) => {
        if (e) {
            e.scrollIntoView({
                inline: firstTabs.includes(tabName) ? 'end' : 'start',
                behavior: 'smooth'
            });
        }
    }

    $: if (isTabActive) {
        showTab(tab)
    }
</script>

<a
    id="sidebar-tab-{tabName}"
    class="sidebar-tab"
    class:active={isTabActive}
    href={tabLink}
    bind:this={tab}
    on:focus={() => showTab(tab)}
>
    <slot></slot>
    {tabName}
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
        -webkit-touch-callout: none;
    }

    .sidebar-tab.active {
        color: var(--sidebar-bg);
        background: var(--sidebar-highlight);
        opacity: 1;
    }

    .sidebar-tab:focus-visible {
        box-shadow: 0 0 0 3px var(--blue) inset;
        outline: none;
        z-index: 1;
    }

    .sidebar-tab.active:focus-visible {
        background: var(--blue);
        color: var(--sidebar-highlight);
    }

    @media (hover: hover) {
        .sidebar-tab:hover {
            opacity: 1;
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
