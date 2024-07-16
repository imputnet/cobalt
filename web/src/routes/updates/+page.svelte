<script lang="ts">
    import { t } from '$lib/i18n/translations';
    import { page } from '$app/stores';

    import { getAllChangelogs } from '$lib/changelogs';
    import type { ChangelogImport } from '$lib/types/changelogs';

    import IconChevronLeft from '@tabler/icons-svelte/IconChevronLeft.svelte';
    import IconChevronRight from '@tabler/icons-svelte/IconChevronRight.svelte';

    const changelogs = getAllChangelogs();
    const versions = Object.keys(changelogs);

    let changelog: ChangelogImport & { version: string } | undefined;
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
        const log = await changelogs[version]() as ChangelogImport;
        if (!log) {
            return; // FIXME: now wot
        }

        changelog = {
            ...log,
            version
        };

        window.location.hash = version;
    }

    const loadNext = () => {
        if (currentIndex < versions.length - 1)
            ++currentIndex;
    }

    const loadPrev = () => {
        if (currentIndex > 0)
            --currentIndex;
    }

    const preloadNext = () => {
        if (!next) return;
        changelogs[next]().catch(() => {});
    }

    $: prev = versions[currentIndex - 1];
    $: next = versions[currentIndex + 1];
    $: currentIndex, loadChangelog();
</script>

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
    }

    .button-wrapper-desktop button {
        position: absolute;
        top: 50%;
        background-color: transparent;
        display: flex;
        border: none;
    }

    .changelog-wrapper {
        max-width: 768pt;
    }

    button[disabled] {
        opacity: 0.5;
        cursor: default;
    }

    .button-wrapper-mobile {
        display: none;
    }

    @media only screen and (max-width: 992pt) {
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
</style>

<svelte:head>
    <title>
        {$t("general.cobalt")}: {$t("tabs.updates")}
    </title>
</svelte:head>

<div class="news">
    {#if changelog}
        <div class="button-wrapper-desktop">
            <button on:click={loadPrev} disabled={!prev}>
                <IconChevronLeft />
                { prev || '' }
            </button>
        </div>
        <div class="changelog-wrapper">
                <svelte:component this={changelog.default} version={changelog.version} />
                <div class="button-wrapper-mobile">
                    <button on:click={loadPrev} disabled={!prev}>
                        <IconChevronLeft />
                        { prev || '' }
                    </button>
                    <button
                        on:click={loadNext}
                        on:focus={preloadNext}
                        on:mousemove={preloadNext}
                        disabled={!next}
                    >
                        { next || '' }
                    <IconChevronRight />
                </button>
                </div>
        </div>
        <div class="button-wrapper-desktop">
            <button
                on:click={loadNext}
                on:focus={preloadNext}
                on:mousemove={preloadNext}
                disabled={!next}
            >
                { next || '' }
                <IconChevronRight />
            </button>
        </div>
    {/if}
</div>