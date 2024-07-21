<script lang="ts">
    import Skeleton from "$components/misc/Skeleton.svelte";
    import type { Optional } from "$lib/types/generic";

    export let version: string;
    export let title: string;
    export let date: string;
    export let banner: Optional<{ file: string; alt: string }>;

    let bannerLoaded = false;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        const months = ['January', 'February', 'March', 'April', 'May',
                        'June', 'July', 'August', 'September', 'October',
                        'November', 'December'];

        return [
            months[date.getUTCMonth()],
            (date.getUTCDate() + 1) + ',',
            date.getUTCFullYear()
        ].join(' ');
    }
</script>

<main>
    <div id="changelog-header" class:no-padding={!banner}>
        <div class="changelog-info">
            <div class="changelog-version">{version}</div>
            <div class="changelog-date">{formatDate(date)}</div>
        </div>
        <h1 class="changelog-title">{title}</h1>
    </div>
    <div class="changelog-content">
        {#if banner}
            <img
                src={`/update-banners/${banner.file}`}
                alt={banner.alt}
                class:loading={!bannerLoaded}
                on:load={() => bannerLoaded = true}
                class="changelog-banner"
            />

            <Skeleton
                class="big changelog-banner"
                hidden={bannerLoaded}
            />
        {/if}
        <div class="contents">
            <slot></slot>
        </div>
    </div>
</main>

<style src="./ChangelogEntry.css"></style>