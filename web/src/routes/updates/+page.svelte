<script lang="ts">
    import { onMount } from 'svelte';
    import type { ChangelogImport } from '$lib/types/changelogs';
    import { t } from '$lib/i18n/translations';
    import { page } from '$app/stores';
    import { getAllChangelogs } from '$lib/changelogs';

    const changelogs = getAllChangelogs();
    const versions = Object.keys(changelogs);

    let changelog: ChangelogImport & { version: string } | undefined;
    let currentIndex = -1;
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

    const nextChangelog = async () => {
        ++currentIndex;
        await loadChangelog();
    }

    onMount(async () => {
        if (versions.length > 0) {
            await nextChangelog()
        } else {
            // TODO: handle if no changelogs are present
            // (can this happen? maybe)
        }
    });
</script>

<style>
    .news {
        max-width: 768px;
        margin: 0 auto;
    }
</style>

<svelte:head>
    <title>
        {$t("general.cobalt")}: {$t("tabs.updates")}
    </title>
</svelte:head>

<div class="news">
    {#if changelog}
        <svelte:component this={changelog.default} version={changelog.version} />
    {/if}
    {#if versions[currentIndex + 1]}
        <button on:click={nextChangelog}>next</button>
    {/if}
</div>