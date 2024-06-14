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
        padding: var(--sidebar-padding) 5px;
        color: var(--accent);
        font-size: var(--sidebar-font-size);
        opacity: 0.8;
    }
    .sidebar-tab.active {
        color: var(--background);
        background: var(--accent);
        opacity: 1;
    }
    .sidebar-tab:hover {
        opacity: 1;
    }
</style>
