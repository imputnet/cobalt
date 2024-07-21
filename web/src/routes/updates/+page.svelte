<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { page } from "$app/stores";

    import { getAllChangelogs } from "$lib/changelogs";
    import type { ChangelogImport } from "$lib/types/changelogs";

    import ChangelogSkeleton from "$components/changelog/ChangelogSkeleton.svelte";

    import IconChevronLeft from "@tabler/icons-svelte/IconChevronLeft.svelte";
    import IconChevronRight from "@tabler/icons-svelte/IconChevronRight.svelte";

    const changelogs = getAllChangelogs();
    const versions = Object.keys(changelogs);

    let changelog: { version: string; page: Promise<ChangelogImport> } | undefined;
    let currentIndex = 0;

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
            page: changelogs[version]() as Promise<ChangelogImport>
        }

        window.location.hash = version;
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

    $: prev = versions[currentIndex - 1];
    $: next = versions[currentIndex + 1];
    $: currentIndex, loadChangelog();
</script>

<svelte:head>
    <title>
        {$t("general.cobalt")}: {$t("tabs.updates")}
    </title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="news">
    {#if changelog}
        <div id="left-button" class="button-wrapper-desktop">
            {#if prev}
                <button on:click={loadPrev}>
                    <IconChevronLeft />
                    {prev || ""}
                </button>
            {/if}
        </div>
        <div class="changelog-wrapper">
            {#await changelog.page}
                {#key changelog.version}
                    <ChangelogSkeleton version={changelog.version} />
                {/key}
            {:then page}
                <svelte:component
                    this={page.default}
                    {...page.metadata}
                    version={changelog.version}
                />
            {/await}
            <div class="button-wrapper-mobile">
                <button on:click={loadPrev} disabled={!prev}>
                    <IconChevronLeft />
                    {prev || ""}
                </button>
                <button
                    on:click={loadNext}
                    on:focus={preloadNext}
                    on:mousemove={preloadNext}
                    disabled={!next}
                >
                    {next || ""}
                    <IconChevronRight />
                </button>
            </div>
        </div>
        <div id="right-button" class="button-wrapper-desktop">
            {#if next}
                <button
                    on:click={loadNext}
                    on:focus={preloadNext}
                    on:mousemove={preloadNext}
                >
                    {next || ""}
                    <IconChevronRight />
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

    button[disabled] {
        opacity: 0;
        cursor: default;
        pointer-events: none;
    }

    .button-wrapper-mobile {
        display: none;
    }

    @media only screen and (max-width: 1150px) {
        .button-wrapper-mobile {
            display: flex;
            padding-bottom: 1rem;
            margin-left: 1rem;
            margin-right: 1rem;
            justify-content: space-between;
        }

        .button-wrapper-desktop {
            display: none;
        }
    }

    @media screen and (max-width: 535px) {
        .changelog-wrapper {
            padding-top: var(--padding)
        }
    }
</style>
