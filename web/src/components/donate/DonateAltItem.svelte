<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { copyURL, openURL } from "$lib/download";

    import CopyIcon from "$components/misc/CopyIcon.svelte";
    import IconExternalLink from "@tabler/icons-svelte/IconExternalLink.svelte";

    export let type: "copy" | "open";
    export let name: string;
    export let address: string;
    export let title = "";

    let copied = false;

    $: if (copied) {
        setTimeout(() => {
            copied = false;
        }, 1500);
    }
</script>

<div class="wallet-holder">
    <button
        class="wallet"
        aria-label={$t(`donate.alt.${type}`, {
            value: name,
        })}
        on:click={() => {
            if (type === "copy") {
                copied = true;
                copyURL(address);
            } else {
                openURL(address);
            }
        }}
    >
        <div class="wallet-icon">
            {#if type === "copy"}
                <CopyIcon regularIcon={true} check={copied} />
            {:else}
                <IconExternalLink />
            {/if}
        </div>

        <div class="wallet-text">
            <div class="wallet-name">{name}</div>
            <span class="wallet-address">
                {#if title}
                    {title}
                {:else if type === "copy"}
                    {address}
                {:else}
                    {address.split("//", 2)[1]}
                {/if}
            </span>
        </div>
    </button>
</div>

<style>
    .wallet-holder {
        display: flex;
        gap: 6px;
        flex-direction: column;
        overflow: hidden;
    }

    .wallet-name {
        font-size: 13px;
        color: var(--gray);
        font-weight: 400;
    }

    .wallet {
        overflow: clip;
        justify-content: flex-start;
        align-items: center;
        text-align: left;
        line-break: anywhere;
        padding: 0;
        gap: 10px;
    }

    .wallet-icon {
        min-width: 42px;
        max-width: 42px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1.5px var(--button-stroke) solid;
        margin-left: 3px;
    }

    .wallet-text {
        display: flex;
        flex-direction: column;
        padding: 6px 0;
    }

    .wallet-icon :global(svg) {
        width: 18px;
        height: 18px;
        color: var(--secondary);
    }

    .wallet-text,
    .wallet-address {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .wallet-address {
        font-size: 14px;
    }
</style>
