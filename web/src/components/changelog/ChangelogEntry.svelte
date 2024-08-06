<script lang="ts">
    import { onMount } from "svelte";

    import type { Optional } from "$lib/types/generic";

    import Skeleton from "$components/misc/Skeleton.svelte";

    export let version: string;
    export let title: string = "";
    export let date: string = "";
    export let banner: Optional<{ file: string; alt: string }> = undefined;
    export let skeleton = false;

    let bannerLoaded = false;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        const months = ["January", "February", "March", "April", "May",
                        "June", "July", "August", "September", "October",
                        "November", "December"];

        return [
            months[date.getUTCMonth()],
            date.getUTCDate() + 1 + ",",
            date.getUTCFullYear(),
        ].join(" ");
    };

    onMount(() => {
        const to_focus: HTMLElement | null =
            document.querySelector("[data-first-focus]");
        to_focus?.focus();
    });
</script>

<main id="changelog-parent">
    <div id="changelog-header" class:no-padding={!banner && !skeleton}>
        <div class="changelog-info">
            <div
                class="changelog-version"
                data-first-focus
                data-focus-ring-hidden
                tabindex="-1"
            >
                {version}
            </div>
            <div class="changelog-date">
                {#if skeleton}
                    <Skeleton width="8em" height="16px" />
                {:else}
                    {formatDate(date)}
                {/if}
            </div>
        </div>
        {#if skeleton}
            <Skeleton width="100%" height="27.59px" />
        {:else}
            <h1 class="changelog-title">{title}</h1>
        {/if}
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

            <Skeleton class="big changelog-banner" hidden={bannerLoaded} />
        {/if}

        {#if skeleton}
            <Skeleton class="big changelog-banner" width="100%" />
        {/if}
        <div class="changelog-body long-text-noto">
            {#if skeleton}
                {#each { length: 3 + Math.random() * 5 } as _}
                    <p>
                        <Skeleton
                            width="100%"
                            height={Math.random() * 84 + 16 + "px"}
                        />
                    </p>
                {/each}
            {:else}
                <slot></slot>
            {/if}
        </div>
    </div>
</main>

<style>
    #changelog-parent {
        overflow-x: hidden;
    }

    #changelog-header {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: calc(var(--padding) / 2);
        padding-bottom: 1em; /* match default <p> padding */
    }

    #changelog-header.no-padding {
        padding-bottom: 0;
    }

    .changelog-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 14px;
    }

    .changelog-version {
        padding: 3px 8px;
        border-radius: 6px;
        background-color: var(--secondary);
        color: var(--primary);
        font-size: 18px;
        font-weight: 500;
    }

    .changelog-date {
        font-size: 13px;
        font-weight: 500;
        color: var(--gray);
    }

    .changelog-title {
        padding: 0;
        line-height: 1.2;
        font-size: 23px;
        user-select: text;
        -webkit-user-select: text;
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

    .changelog-banner.loading {
        display: none;
    }

    .changelog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .changelog-body {
        width: 100%;
    }
</style>
