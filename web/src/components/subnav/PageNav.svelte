<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { defaultNavPage } from "$lib/subnav";

    import { t } from "$lib/i18n/translations";

    import IconArrowLeft from "@tabler/icons-svelte/IconArrowLeft.svelte";

    export let pageName: "settings" | "about";
    export let homeNavPath: string;
    export let homeTitle: string;
    export let pageSubtitle = "";
    export let contentPadding = false;
    export let wideContent = false;

    let screenWidth: number;

    $: currentPageTitle = $page.url.pathname.split("/").at(-1);
    $: stringPageTitle =
        currentPageTitle !== pageName
            ? ` / ${$t(`${pageName}.page.${currentPageTitle}`)}`
            : "";

    $: isMobile = screenWidth <= 750;
    $: isHome = $page.url.pathname === homeNavPath;
    $: {
        if (browser && !isMobile && isHome) {
            goto(defaultNavPage(pageName), { replaceState: true });
        }
    }
</script>

<svelte:head>
    <title>
        {homeTitle}{stringPageTitle} ~ {$t("general.cobalt")}
    </title>
    <meta
        property="og:title"
        content="{homeTitle}{stringPageTitle} ~ {$t('general.cobalt')}"
    />
</svelte:head>

<svelte:window bind:innerWidth={screenWidth} />

<div id="{pageName}-page" class="subnav-page">
    <div class="subnav-sidebar" class:back-visible={!isHome && isMobile}>
        <div class="subnav-header">
            {#if isMobile}
                {#if !isHome}
                    <a
                        class="back-button"
                        href={homeNavPath}
                        role="button"
                        aria-label={$t("a11y.general.back")}
                    >
                        <IconArrowLeft />
                    </a>
                {/if}
                <h3
                    class="subnav-page-title"
                    aria-level="1"
                    tabindex="-1"
                    data-first-focus
                    data-focus-ring-hidden
                >
                    {#if !isHome}
                        {$t(`${pageName}.page.${currentPageTitle}`)}
                    {:else}
                        {homeTitle}
                    {/if}
                </h3>
            {:else}
                {#if pageSubtitle}
                    <div class="subtext subnav-subtitle">
                        {pageSubtitle}
                    </div>
                {/if}
                <h2 class="subnav-page-title" aria-level="1">
                    {homeTitle}
                </h2>
            {/if}
        </div>

        <nav
            class="subnav-navigation"
            class:visible-mobile={isMobile && isHome}
        >
            <slot name="navigation"></slot>
            {#if isMobile && isHome && pageSubtitle}
                <div class="subtext subnav-subtitle center">
                    {pageSubtitle}
                </div>
            {/if}
        </nav>
    </div>

    {#if !isMobile || !isHome}
        <main
            id="{pageName}-page-content"
            class="subnav-page-content"
            class:padding={contentPadding}
            class:wide={wideContent}
            tabindex="-1"
            data-first-focus
            data-focus-ring-hidden
        >
            <slot name="content"></slot>
        </main>
    {/if}
</div>

<style>
    .subnav-page {
        --subnav-nav-width: 250px;
        --subnav-padding: 30px;
        --subnav-padding-small: calc(var(--subnav-padding) - var(--padding));
        display: grid;
        width: 100%;
        grid-template-columns: var(--subnav-nav-width) 1fr;
        overflow: hidden;
        padding-left: var(--subnav-padding);
    }

    .subnav-page-content {
        display: flex;
        flex-direction: column;
        max-width: 600px;
        padding: calc(var(--subnav-padding) / 2);
        overflow-y: scroll;
    }

    .subnav-page-content.wide {
        max-width: 800px;
    }

    .subnav-page-content.padding {
        padding: var(--subnav-padding);
    }

    .subnav-sidebar,
    .subnav-navigation {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
    }

    .subnav-sidebar {
        width: var(--subnav-nav-width);
        padding-top: var(--subnav-padding);
    }

    .subnav-sidebar.back-visible {
        overflow: visible;
    }

    .subnav-sidebar {
        gap: var(--padding);
    }

    .subnav-navigation {
        gap: var(--padding);
        padding-bottom: var(--padding);
    }

    .subnav-header {
        --back-padding: calc(var(--padding) / 2);
    }

    .subnav-subtitle {
        padding: 0;
    }

    .subnav-subtitle.center {
        text-align: center;
    }

    .back-button {
        display: flex;
        align-items: center;
        color: var(--secondary);
        gap: var(--back-padding);
        padding: var(--back-padding);

        position: absolute;
        left: var(--back-padding);
    }

    .back-button:active {
        background: var(--button-hover-transparent);
        border-radius: var(--border-radius);
    }

    .back-button :global(svg) {
        stroke-width: 1.8px;
        height: 22px;
        width: 22px;
        will-change: transform;
    }

    @media screen and (max-width: 750px) {
        .subnav-page {
            --subnav-nav-width: 100%;
            display: flex;
            flex-direction: column;
            grid-template-columns: 1fr;
            padding: 0;
        }

        .subnav-navigation {
            padding: var(--padding);
            padding-bottom: calc(var(--padding) * 2);
            display: none;
        }

        .subnav-navigation.visible-mobile {
            display: flex;
        }

        .subnav-page-content {
            padding: var(--padding) 0;
            padding-top: 0;
            max-width: unset;
        }

        .subnav-page-content.padding {
            padding: var(--padding);
        }

        .subnav-header {
            display: flex;
            align-items: center;
            position: sticky;
            padding: var(--padding);
            gap: 4px;
            justify-content: center;
        }

        .subnav-sidebar {
            gap: 0px;
            padding: 0;
        }

        .subnav-page-title {
            text-align: center;
            letter-spacing: -0.3px;
            font-size: 16.5px;
        }
    }
</style>
