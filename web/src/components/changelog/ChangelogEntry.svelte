<script lang="ts">
    import { onMount } from "svelte";

    import type { Optional } from "$lib/types/generic";

    import Skeleton from "$components/misc/Skeleton.svelte";

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

    onMount(() => {
        const to_focus: HTMLElement | null =
            document.querySelector("[data-first-focus]");
        to_focus?.focus();
    });
</script>

<main id="changelog-parent">
    <div id="changelog-header" class:no-padding={!banner}>
        <div class="changelog-info">
            <div
                class="changelog-version"
                data-first-focus
                data-focus-ring-hidden
                tabindex="-1"
            >{version}</div>
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
        <div class="changelog-body">
            <slot></slot>
        </div>
    </div>
</main>

<style>
    /* all styles are global because of skeleton */

    :global(#changelog-parent) {
        overflow-x: hidden;
    }

    :global(#changelog-header) {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: calc(var(--padding) / 2);
        padding-bottom: 1em; /* match default <p> padding */
    }

    :global(#changelog-header.no-padding) {
        padding-bottom: 0;
    }

    :global(.changelog-info) {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 14px;
    }

    :global(.changelog-version) {
        padding: 3px 8px;
        border-radius: 6px;
        background-color: var(--secondary);
        color: var(--primary);
        font-size: 18px;
        font-weight: 500;
    }

    :global(.changelog-date) {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray);
    }

    :global(.changelog-title) {
        padding: 0;
        line-height: 1.2;
        font-size: 23px;
        user-select: text;
        -webkit-user-select: text
    }

    :global(.changelog-banner) {
        display: block;
        object-fit: cover;
        max-height: 320pt;
        min-height: 210pt;
        width: 100%;
        aspect-ratio: 16/9;
        border-radius: var(--padding);
    }

    :global(.changelog-banner.loading) {
        display: none;
    }

    :global(.changelog-content) {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    :global(.changelog-body) {
        width: 100%;
    }

    :global(.changelog-body),
    :global(.changelog-body) :global(*) {
        line-height: 1.7;
        font-size: 14.5px;
        font-weight: 410;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono", monospace;
        user-select: text;
        -webkit-user-select: text;
    }

    :global(.changelog-body ul) {
        padding-inline-start: 30px;
    }

    :global(.changelog-body li) {
        padding-left: 3px;
    }

    @media screen and (max-width: 535px) {
        :global(.changelog-body),
        :global(.changelog-body) :global(*) {
            font-size: 14px;
        }
    }

</style>
