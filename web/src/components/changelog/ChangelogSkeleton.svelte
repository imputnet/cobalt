<script lang="ts">
    import Skeleton from "$components/misc/Skeleton.svelte";
    export let version: string;
</script>

<main>
    <div id="changelog-header">
        <div class="changelog-info">
            <div class="changelog-version">{ version }</div>
            <div class="changelog-date">
                <Skeleton
                    width="8em"
                    height="16px"
                />
            </div>
        </div>
        <h1 class="changelog-title">
            <Skeleton
                width="28em"
                height="27.59px"
            />
        </h1>
    </div>
    <div class="changelog-content">
        <Skeleton
            class="big changelog-banner"
            width="100%"
        />
        <div class="contents">
            {#each {length: 3 + Math.random() * 5} as _}
                <p>
                    <Skeleton
                        width="100%"
                        height={(Math.random() * 84 + 16) + 'px'}
                    />
                </p>
            {/each}
        </div>
    </div>
</main>

<style>
    main {
        overflow-x: hidden;
    }

    #changelog-header {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: calc(var(--padding) / 2);
        padding-bottom: 1em; /* match default <p> padding */
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
        -webkit-user-select: text
    }

    :global(#banner-skeleton) {
        display: block;
        max-height: 320pt;
        min-height: 210pt;
        width: 100%;
        aspect-ratio: 16/9;
        border-radius: var(--padding);
    }

    .changelog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .contents {
        width: 100%;
    }

    .contents,
    .contents :global(*) {
        line-height: 1.7;
        font-size: 14.5px;
        font-weight: 410;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono", monospace;
        user-select: text;
        -webkit-user-select: text;
    }

    :global(ul) {
        padding-inline-start: 30px;
    }

    :global(li) {
        padding-left: 3px;
    }

    @media screen and (max-width: 535px) {
        .contents,
        .contents :global(*) {
            font-size: 14px;
        }
    }
</style>
