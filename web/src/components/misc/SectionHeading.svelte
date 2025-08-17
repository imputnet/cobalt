<script lang="ts">
    import { page } from "$app/state";
    import { copyURL } from "$lib/download";
    import { t } from "$lib/i18n/translations";
    import { hapticConfirm } from "$lib/haptics";

    import CopyIcon from "$components/misc/CopyIcon.svelte";

    type Props = {
        title: string;
        sectionId: string;
        beta?: boolean;
        nolink?: boolean;
        copyData?: string;
    };

    let {
        title,
        sectionId,
        beta = false,
        nolink = false,
        copyData = "",
    }: Props = $props();

    const sectionURL = `${page.url.origin}${page.url.pathname}#${sectionId}`;

    let copied = $state(false);
</script>

<div class="heading-container">
    <h3 id="{sectionId}-title" class="content-title">
        {title}
    </h3>

    {#if beta}
        <div class="beta-label">
            {$t("general.beta")}
        </div>
    {/if}

    {#if !nolink}
        <button
            class="link-copy"
            aria-label={copied
                ? $t("button.copied")
                : $t(`button.copy${copyData ? "" : ".section"}`)}
            onclick={() => {
                if (!copied) {
                    copyURL(copyData || sectionURL);
                    hapticConfirm();
                    copied = true;
                    setTimeout(() => {
                        copied = false;
                    }, 1500);
                }
            }}
        >
            <CopyIcon check={copied} regularIcon={!!copyData} />
        </button>
    {/if}
</div>

<style>
    .heading-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap-reverse;
        gap: 6px;
        justify-content: start;
        align-items: center;
        box-shadow: none;
    }

    .link-copy {
        background: transparent;
        padding: 2px;
        box-shadow: none;
        border-radius: 5px;
        transition: opacity 0.2s;
        opacity: 0.7;
    }

    .link-copy:focus-visible {
        opacity: 1;
        outline-offset: 0;
    }

    .link-copy :global(.copy-animation) {
        width: 17px;
        height: 17px;
    }

    .link-copy :global(.copy-animation *) {
        width: 17px;
        height: 17px;
    }

    .beta-label {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        padding: 0 5px;
        background: var(--secondary);
        color: var(--primary);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.86;
        text-transform: uppercase;
    }

    @media (hover: hover) {
        .heading-container:hover .link-copy {
            opacity: 1;
        }
    }
</style>
