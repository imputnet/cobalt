<script lang="ts">
    import { page } from "$app/stores";

    import IconChevronRight from "@tabler/icons-svelte/IconChevronRight.svelte";

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
    <div class="settings-tab-left">
        <div class="tab-icon" style="background: var(--{iconColor})">
            <slot></slot>
        </div>
        <span>{tabName}</span>
    </div>
    <div class="settings-tab-chevron">
        <IconChevronRight />
    </div>
</a>

<style>
    .settings-tab {
        --small-padding: 4px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--small-padding) * 2);
        padding: 7px;
        font-weight: 500;
        background: var(--primary);
        color: var(--button-text);
        border-radius: var(--border-radius);
        overflow: hidden;
    }

    .settings-tab-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: calc(var(--small-padding) * 2);
        font-weight: 500;
    }

    .settings-tab :global(svg) {
        stroke-width: 1.5px;
        height: 18px;
        width: 18px;
    }

    .settings-tab .tab-icon :global(svg) {
        stroke: var(--white);
    }

    .settings-tab-chevron :global(svg) {
        display: none;
        stroke: var(--secondary);
    }

    @media (hover: hover) {
        .settings-tab:hover {
            background: var(--button-hover-transparent);
        }
    }

    .settings-tab:active {
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
        padding: var(--small-padding);
        border-radius: var(--small-padding);
    }

    @media screen and (max-width: 750px) {
        .settings-tab {
            background: none;
            --small-padding: 5px;
        }

        .settings-tab :global(svg) {
            height: 19px;
            width: 19px;
        }

        .settings-tab-chevron :global(svg) {
            display: block;
        }
    }
</style>
