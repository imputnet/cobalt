<script lang="ts">
    import { contacts } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import { openURL, copyURL, shareURL } from "$lib/download";

    import DonateCardContainer from "$components/donate/DonateCardContainer.svelte";

    import IconShare2 from "@tabler/icons-svelte/IconShare2.svelte";
    import IconBrandGithub from "@tabler/icons-svelte/IconBrandGithub.svelte";
    import IconBrandTwitter from "@tabler/icons-svelte/IconBrandTwitter.svelte";
    import IconMoodSmileBeam from "@tabler/icons-svelte/IconMoodSmileBeam.svelte";

    import CobaltQr from "$lib/icons/CobaltQR.svelte";
    import CopyIcon from "$components/misc/CopyIcon.svelte";

    const cobaltUrl = "https://cobalt.tools/";

    let copied = false;

    $: if (copied) {
        setTimeout(() => {
            copied = false;
        }, 1500);
    }
</script>

<DonateCardContainer id="share-box">
    <div id="share-card-header">
        <div class="share-header-icon"><IconMoodSmileBeam /></div>
        <div class="donate-card-title">{$t("donate.share.title")}</div>
    </div>
    <div id="share-card-body">
        <div id="share-qr">
            <CobaltQr />
        </div>
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
        </div>
    </div>
    <div class="donate-card-subtitle share-footer-link">cobalt.tools</div>
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

    #share-qr :global(svg) {
        width: 140px;
        height: 140px;
        border-radius: 12px;
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

    @media screen and (max-width: 550px) {
        :global(#share-box) {
            width: calc(100% - var(--donate-card-main-padding) * 2);
        }
    }
</style>
