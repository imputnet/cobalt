<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import type { Optional } from "$lib/types/generic";

    import Skeleton from "$components/misc/Skeleton.svelte";

    type Props = {
        version: string;
        title?: string;
        date?: string;
        banner?: Optional<{ file: string; alt: string }>;
        skeleton?: boolean;
        children?: Snippet
    };

    const { version, title, date, banner, skeleton, children }: Props = $props();

    let bannerLoaded = $state(false);
    let hideSkeleton = $state(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ["January", "February", "March", "April", "May",
                        "June", "July", "August", "September", "October",
                        "November", "December"];

        return [
            months[date.getMonth()],
            date.getDate() + ",",
            date.getFullYear(),
        ].join(" ");
    };

    const loaded = () => {
        bannerLoaded = true;

        // remove the skeleton after the image is done fading in
        setTimeout(() => {
            hideSkeleton = true;
        }, 200)
    }

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
                tabindex="-1"
            >
                {version}
            </div>
            <div class="changelog-date">
                {#if skeleton}
                    <Skeleton width="8em" height="16px" />
                {:else if date}
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
            <div class="changelog-banner-container">
                <img
                    src={`/update-banners/${banner.file}`}
                    alt={banner.alt}
                    class:loading={!bannerLoaded}
                    onload={loaded}
                    class="changelog-banner"
                />
                <Skeleton class="big changelog-banner" hidden={hideSkeleton} />
            </div>
        {/if}

        {#if skeleton}
            <Skeleton class="big changelog-banner" width="100%" />
        {/if}
        <div class="changelog-body long-text">
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
                {@render children?.()}
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

    .changelog-banner-container {
        object-fit: cover;
        max-height: 350pt;
        min-height: 180pt;
        width: 100%;
        aspect-ratio: 16/9;
        position: relative;
    }

    :global(.changelog-banner) {
        object-fit: cover;
        width: 100%;
        height: 100%;
        aspect-ratio: 16/9;
        border-radius: var(--padding);
        pointer-events: all;

        opacity: 1;
        transition: opacity 0.15s;

        position: absolute;
        z-index: 2;
    }

    :global(.skeleton.changelog-banner) {
        z-index: 1;
        position: relative;
    }

    .changelog-banner.loading {
        opacity: 0;
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
