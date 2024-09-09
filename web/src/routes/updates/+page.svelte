<script lang="ts">
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    import { t } from "$lib/i18n/translations";
    import { getAllChangelogs } from "$lib/changelogs";
    import type { Optional } from "$lib/types/generic";
    import type { ChangelogImport } from "$lib/types/changelogs";

    import ChangelogEntry from "$components/changelog/ChangelogEntry.svelte";

    import IconArrowLeft from "@tabler/icons-svelte/IconArrowLeft.svelte";
    import IconArrowRight from "@tabler/icons-svelte/IconArrowRight.svelte";

    const changelogs = getAllChangelogs();
    const versions = Object.keys(changelogs);

    let changelog: Optional<{
        version: string;
        page: Promise<ChangelogImport>;
    }>;
    let currentIndex = 0;
    let wrapper: HTMLDivElement;

    {
        const hash = $page.url.hash.replace("#", "");
        const versionIndex = versions.indexOf(hash);
        if (versionIndex !== -1 && currentIndex !== versionIndex) {
            currentIndex = versionIndex;
        }
    }

    const loadChangelog = async () => {
        const version = versions[currentIndex];
        changelog = {
            version,
            page: changelogs[version]() as Promise<ChangelogImport>,
        };

        if (browser) {
            window.location.hash = version;
        }

        await changelog.page;
    };

    const loadNext = () => {
        if (currentIndex < versions.length - 1) ++currentIndex;
    };

    const loadPrev = () => {
        if (currentIndex > 0) --currentIndex;
    };

    const preloadNext = () => {
        if (!next) return;
        changelogs[next]().catch(() => {});
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") loadPrev();
        else if (e.key === "ArrowRight") loadNext();
    };

    const handleScroll = (e: WheelEvent) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }

        if (!wrapper.contains(e.target)) {
            wrapper.scrollTop += e.deltaY;
            e.preventDefault();
        }
    };

    $: prev = versions[currentIndex - 1];
    $: next = versions[currentIndex + 1];
    $: currentIndex, loadChangelog();
</script>

<svelte:head>
    <title>
        {$t("tabs.updates")} ~ {$t("general.cobalt")}
    </title>
    <meta
        property="og:title"
        content="{$t("tabs.updates")} ~ {$t("general.cobalt")}"
    />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="news" tabindex="-1" data-focus-ring-hidden on:wheel={handleScroll}>
    {#if changelog}
        <div id="left-button" class="button-wrapper-desktop">
            {#if prev}
                <button
                    on:click={loadPrev}
                    aria-label={$t("updates.button.previous", { value: prev })}
                >
                    <IconArrowLeft />
                    {prev || ""}
                </button>
            {/if}
        </div>
        <div class="changelog-wrapper" bind:this={wrapper}>
            {#await changelog.page}
                {#key changelog.version}
                    <ChangelogEntry
                        version={changelog.version}
                        skeleton
                    />
                {/key}
            {:then page}
                <svelte:component
                    this={page.default}
                    {...page.metadata}
                    version={changelog.version}
                />
            {/await}

            <div class="button-wrapper-mobile" class:only-right={!prev}>
                {#if prev}
                    <button
                        on:click={loadPrev}
                        aria-label={$t("updates.button.previous", { value: prev })}
                    >
                        <IconArrowLeft />
                        {prev || ""}
                    </button>
                {/if}
                {#if next}
                    <button
                        on:click={loadNext}
                        on:focus={preloadNext}
                        on:mousemove={preloadNext}
                        aria-label={$t("updates.button.next", { value: next })}
                    >
                        {next || ""}
                        <IconArrowRight />
                    </button>
                {/if}
            </div>
        </div>
        <div id="right-button" class="button-wrapper-desktop">
            {#if next}
                <button
                    on:click={loadNext}
                    on:focus={preloadNext}
                    on:mousemove={preloadNext}
                    aria-label={$t("updates.button.next", { value: next })}
                >
                    {next || ""}
                    <IconArrowRight />
                </button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .news {
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: space-evenly;
    }

    .button-wrapper-desktop {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .button-wrapper-desktop button {
        position: absolute;
        background-color: transparent;
        display: flex;
        border: none;
    }

    button :global(svg) {
        stroke-width: 1.6px;
    }

    .button-wrapper-desktop button:not(:focus-visible) {
        box-shadow: none;
    }

    .changelog-wrapper {
        flex: 1;
        max-width: 850px;
        overflow-x: hidden;
        padding: var(--padding);
        padding-top: calc(var(--padding) + 1em);
    }

    .button-wrapper-mobile {
        display: none;
    }

    @media only screen and (max-width: 1150px) {
        .button-wrapper-mobile {
            display: flex;
            padding: var(--border-radius);
            padding-top: 0;
            justify-content: space-between;
        }

        .button-wrapper-mobile.only-right {
            justify-content: end;
        }

        .button-wrapper-desktop {
            display: none;
        }
    }

    @media screen and (max-width: 535px) {
        .changelog-wrapper {
            padding-top: var(--padding);
        }
    }
</style>
