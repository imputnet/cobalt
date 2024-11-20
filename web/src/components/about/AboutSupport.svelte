<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { openURL } from "$lib/download";

    import IconExternalLink from "@tabler/icons-svelte/IconExternalLink.svelte";

    import IconBrandGithub from "@tabler/icons-svelte/IconBrandGithub.svelte";
    import IconBrandTwitter from "@tabler/icons-svelte/IconBrandTwitter.svelte";
    import IconBrandDiscord from "@tabler/icons-svelte/IconBrandDiscord.svelte";
    import IconBrandTelegram from "@tabler/icons-svelte/IconBrandTelegram.svelte";
    import IconBrandBluesky from "@tabler/icons-svelte/IconBrandBluesky.svelte";

    const platformIcons = {
        github: {
            icon: IconBrandGithub,
            color: "#8842cd",
        },
        discord: {
            icon: IconBrandDiscord,
            color: "#5865f2",
        },
        twitter: {
            icon: IconBrandTwitter,
            color: "#1da1f2",
        },
        telegram: {
            icon: IconBrandTelegram,
            color: "#1c9efb",
        },
        bluesky: {
            icon: IconBrandBluesky,
            color: "#0a78ff",
        },
    };

    export let platform: keyof typeof platformIcons;
    export let externalLink: string;
</script>

<button
    class="support-card"
    role="link"
    on:click={() => {
        openURL(externalLink);
    }}
>
    <div class="support-card-header">
        <div
            class="icon-holder support-icon-{platform}"
            style="
                background-color: {platformIcons[platform].color};
                box-shadow: 0 0 90px 10px {platformIcons[platform].color};
            "
        >
            <svelte:component this={platformIcons[platform].icon} />
        </div>
        <div class="support-card-title">
            {platform}
            <IconExternalLink />
        </div>
    </div>
    <div class="subtext support-card-description">
        {$t(`about.support.${platform}`)}
    </div>
</button>

<style>
    .support-card {
        padding: var(--padding);
        gap: 4px;
        height: fit-content;

        text-align: start;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        overflow: hidden;
    }

    .support-card-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .icon-holder {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--gray);

        padding: 4px;
        border-radius: 5px;
    }

    .icon-holder :global(svg) {
        width: 20px;
        height: 20px;
        stroke-width: 1.5px;
        stroke: var(--white);
    }

    .support-card-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
    }

    .support-card-title :global(svg) {
        stroke: var(--secondary);
        opacity: 0.5;
        width: 14px;
        height: 14px;
    }

    .support-card-description {
        padding: 0;
    }
</style>
