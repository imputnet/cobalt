<script lang="ts">
    import { page } from "$app/stores";

    import { t } from "$lib/i18n/translations";

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
    role="button"
>   
    <div class="settings-tab-left">
        <div class="tab-icon" style="background: var(--{iconColor})">
            <slot></slot>
        </div>
        <span>{$t(`settings.page.${tabName}`)}</span>
    </div>
    <div class="settings-tab-chevron">
        <IconChevronRight />
    </div>
</a>

<style>
    .settings-tab {
        --small-padding: 4px;
        --big-padding: 7px;
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
    }

    .settings-tab-left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: calc(var(--big-padding) * 1.5);
        font-weight: 500;
    }

    .settings-tab :global(svg) {
        stroke-width: 1.5px;
        height: 20px;
        width: 20px;
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
            padding: var(--big-padding) calc(var(--big-padding) * 1.5);
        }

        .settings-tab-left {
            gap: calc(var(--big-padding) * 1.5);
        }

        .settings-tab:not(:last-child) {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            box-shadow: 0 3px 0px -1.7px var(--button-stroke);
        }

        .settings-tab:not(:first-child) {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        .settings-tab-chevron :global(svg) {
            display: block;
        }
    }
</style>
