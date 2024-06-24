<script lang="ts">
    import { page } from "$app/stores";

    export let tabName: string;
    export let tabLink: string;
    export let iconColor: "gray" | "blue" | "green" = "gray";

    $: isActive = $page.url.pathname === `/settings/${tabLink}`;
</script>

<a
    class="settings-tab"
    href="/settings/{tabLink}"
    class:active={isActive}
>
    <div class="tab-icon" style="background: var(--{iconColor})">
        <slot></slot>
    </div>
    <span>{tabName}</span>
</a>

<style>
    .settings-tab {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 8px;
        font-weight: 500;
        background: var(--primary);
        color: var(--button-text);
        border-radius: var(--border-radius);
    }

    .settings-tab :global(svg) {
        stroke: var(--white);
        stroke-width: 1.5px;
        height: 18px;
        width: 18px;
    }

    .settings-tab:hover {
        background: var(--button-hover-transparent);
    }

    .settings-tab.active {
        background: var(--secondary);
        color: var(--primary);
    }

    .settings-tab span {
        font-size: 14.5px;
    }

    .tab-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
        border-radius: 5px;
    }
</style>
