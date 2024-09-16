<script lang="ts">
    import { page } from "$app/stores";

    import IconChevronRight from "@tabler/icons-svelte/IconChevronRight.svelte";

    export let tabPath: string;
    export let tabTitle: string;
    export let iconColor: "gray" | "blue" | "green" = "gray";

    $: isActive = $page.url.pathname === tabPath;
</script>

<a
    class="subnav-tab"
    href={tabPath}
    class:active={isActive}
    role="button"
>
    <div class="subnav-tab-left">
        <div class="tab-icon" style="background: var(--{iconColor})">
            <slot></slot>
        </div>
        <div class="subnav-tab-text">
            {tabTitle}
        </div>
    </div>
    <div class="subnav-tab-chevron">
        <IconChevronRight />
    </div>
</a>

<style>
    .subnav-tab {
        --small-padding: 4px;
        --big-padding: 6px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--small-padding) * 2);
        padding: var(--big-padding);
        font-weight: 500;
        background: var(--primary);
        color: var(--button-text);
        border-radius: var(--border-radius);
        overflow: hidden;

        text-decoration: none;
        text-decoration-line: none;
    }

    .subnav-tab-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: calc(var(--big-padding) * 1.5);
        font-weight: 500;
    }

    .tab-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--small-padding);
        border-radius: 5px;
    }

    .subnav-tab .tab-icon :global(svg) {
        stroke-width: 1.5px;
        stroke: var(--white);
        height: 20px;
        width: 20px;
    }

    .subnav-tab-chevron :global(svg) {
        display: none;
        stroke-width: 2px;
        stroke: var(--gray);
        height: 18px;
        width: 18px;
    }

    @media (hover: hover) {
        .subnav-tab:hover {
            background: var(--button-hover-transparent);
        }
    }

    .subnav-tab:active {
        background: var(--button-hover-transparent);
    }

    .subnav-tab.active {
        background: var(--secondary);
        color: var(--primary);
    }

    .subnav-tab-text {
        font-size: 14.5px;
        line-height: 1.35;
    }

    @media screen and (max-width: 750px) {
        .subnav-tab {
            --big-padding: 7px;
            background: none;
            padding: var(--big-padding) 11px;
        }

        .subnav-tab:not(:last-child) {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            box-shadow: 48px 3px 0px -1.8px var(--button-stroke);
        }

        .subnav-tab:not(:first-child) {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        .subnav-tab-left {
            gap: 10px;
        }

        .subnav-tab-chevron :global(svg) {
            display: block;
        }
    }
</style>
