<script lang="ts">
    import { contacts } from "$lib/env";
    import { device } from "$lib/device";
    import locale from "$lib/i18n/locale";
    import { t } from "$lib/i18n/translations";

    import { openURL, copyURL, shareURL } from "$lib/download";

    import DonateCardContainer from "$components/donate/DonateCardContainer.svelte";

    import IconShare2 from "@tabler/icons-svelte/IconShare2.svelte";
    import IconBrandGithub from "@tabler/icons-svelte/IconBrandGithub.svelte";
    import IconBrandTwitter from "@tabler/icons-svelte/IconBrandTwitter.svelte";
    import IconMoodSmileBeam from "@tabler/icons-svelte/IconMoodSmileBeam.svelte";

    import CobaltQr from "$components/icons/CobaltQR.svelte";
    import CopyIcon from "$components/misc/CopyIcon.svelte";

    const cobaltUrl = "https://cobalt.tools/";

    let copied = false;

    $: if (copied) {
        setTimeout(() => {
            copied = false;
        }, 1500);
    }

    let expanded = false;
</script>

<DonateCardContainer id="share-box" classes={expanded ? "expanded" : ""}>
    <div id="share-card-header">
        <div class="share-header-icon"><IconMoodSmileBeam /></div>
        <div class="donate-card-title">{$t("donate.share.title")}</div>
    </div>
    <div id="share-card-body">
        <button
            id="share-qr"
            on:click={() => {
                expanded = !expanded;
            }}
            aria-label={$t(
                `a11y.donate.share.qr.${expanded ? "collapse" : "expand"}`
            )}
        >
            <CobaltQr />
        </button>
        <div id="action-buttons">
            <button
                id="action-button-copy"
                class="action-button"
                on:click={async () => {
                    copyURL(cobaltUrl);
                    copied = true;
                }}
                aria-label={copied ? $t("button.copied") : ""}
            >
                <div class="action-button-icon">
                    <CopyIcon check={copied} />
                </div>
                copy
            </button>

            {#if device.supports.share}
                <button
                    id="action-button-share"
                    class="action-button"
                    on:click={async () => shareURL(cobaltUrl)}
                >
                    <div class="action-button-icon">
                        <IconShare2 />
                    </div>
                    {$t("button.share")}
                </button>
            {/if}

            <button
                id="action-button-github"
                class="action-button"
                on:click={async () => openURL(contacts.github)}
            >
                <div class="action-button-icon">
                    <IconBrandGithub />
                </div>
                {$t("button.star")}
            </button>

            {#if $locale !== "ru"}
                <button
                    id="action-button-twitter"
                    class="action-button"
                    on:click={async () => openURL(contacts.twitter)}
                >
                    <div class="action-button-icon">
                        <IconBrandTwitter />
                    </div>
                    {$t("button.follow")}
                </button>
            {/if}
        </div>
    </div>
    <div
        class="donate-card-subtitle share-footer-link"
        class:centered={expanded}
    >
        cobalt.tools
    </div>
</DonateCardContainer>

<style>
    :global(#share-box) {
        padding: var(--donate-card-main-padding);
        min-width: 300px;
        width: fit-content;
    }

    #share-card-header {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .centered {
        text-align: center;
    }

    .share-header-icon {
        display: flex;
    }

    .share-header-icon :global(svg) {
        width: 28px;
        height: 28px;
        stroke-width: 1.8px;
    }

    #share-card-body {
        display: flex;
        flex-direction: row;
        gap: 12px;
        max-height: 140px;
    }

    #share-qr {
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        aspect-ratio: 1 / 1;
        padding: 0;
        background: none;
    }

    #share-qr :global(svg) {
        width: 140px;
        height: 140px;
        border-radius: 12px;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity));
    }

    #share-qr:focus-visible {
        box-shadow: none !important;
    }

    #share-qr:focus-visible :global(svg) {
        box-shadow: 0 0 0 2px var(--blue);
    }

    #action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        gap: 6px;
    }

    .action-button {
        align-items: center;
        width: 100%;
        padding: 0 10px;
        font-size: 13px;
        gap: 2px;
    }

    .action-button-icon {
        width: 21px;
        height: 21px;
        display: flex;
    }

    .action-button-icon :global(svg) {
        width: 21px;
        height: 21px;
        stroke-width: 1.8px;
    }

    :global(#share-box.expanded) {
        margin-bottom: -300px;
        z-index: 1;
        box-shadow:
            0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity)) inset,
            0 0 10px 2px rgba(0, 0, 0, 0.5);
        transition: box-shadow 0.15s;
    }

    :global(#share-box.expanded #share-qr svg) {
        width: 99%;
        height: 99%;
        transition: all 0.15s;
    }

    :global(#share-box.expanded) #share-card-body {
        flex-direction: column;
        max-height: unset;
    }

    :global(#share-box.expanded) #action-buttons {
        display: flex;
    }

    :global(#share-box.expanded) .action-button {
        padding: 10px;
        transition: all 0.15s;
    }

    @media screen and (max-width: 760px) {
        :global(#share-box) {
            width: calc(100% - var(--donate-card-main-padding) * 2);
            background: var(--donate-gradient-start);
            min-width: unset;
        }

        :global(#share-box.expanded) {
            margin-bottom: unset;
            z-index: unset;
            box-shadow: 0 0 0 2px
                rgba(255, 255, 255, var(--donate-border-opacity)) inset;
            transition: none;
        }
    }
</style>
