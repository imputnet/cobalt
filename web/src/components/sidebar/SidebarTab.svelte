<script lang="ts">
    import { page } from "$app/stores";

    export let tabName: string;
    export let tabLink: string;

    $: isTabActive = $page.url.pathname === tabLink;
</script>

<a
    id="sidebar-tab-{tabName}"
    class="sidebar-tab"
    class:active={isTabActive}
    href={tabLink}
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
    }

    .sidebar-tab.active {
        color: var(--sidebar-bg);
        background: var(--sidebar-highlight);
        opacity: 1;
    }

    .sidebar-tab:hover {
        opacity: 1;
    }

    .sidebar-tab:focus-visible {
        box-shadow: 0 0 0 1.5px var(--sidebar-highlight) inset;
        outline: none;
        z-index: 1;
    }

    .sidebar-tab.active:focus-visible {
        box-shadow: 0 0 0 1.5px var(--sidebar-bg) inset;
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
