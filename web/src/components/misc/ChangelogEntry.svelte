<script lang="ts">
    export let version: string;
    export let title: string;
    export let date: string | undefined;
    export let banner: { file: string; alt: string } | undefined;

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
    <div id="changelog-header">
        <div class="changelog-info">
            <div class="changelog-version">{version}</div>
            {#if date}
                <div class="changelog-date">{formatDate(date)}</div>
            {/if}
        </div>
        <h1 class="changelog-title">{title}</h1>
    </div>
    <div class="changelog-content">
        {#if banner}
            <img
                src={`/update-banners/${banner.file}`}
                alt={banner.alt}
                class="changelog-banner"
            />
        {/if}
        <div class="contents">
            <slot></slot>
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

    .changelog-banner {
        display: block;
        object-fit: cover;
        max-height: 320pt;
        min-height: 210pt;
        width: 100%;
        max-width: 100;
        aspect-ratio: 16/9;
        border-radius: var(--padding);
    }

    .changelog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .contents {
        max-width: 100%;
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
