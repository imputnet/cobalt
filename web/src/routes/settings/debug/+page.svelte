<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import CopyIcon from "$components/misc/CopyIcon.svelte";

    import { t } from "$lib/i18n/translations";
    import { copyURL } from "$lib/download";
    import { version } from "$lib/version";
    import { device, app } from "$lib/device";
    import { defaultNavPage } from "$lib/subnav";
    import settings, { storedSettings } from "$lib/state/settings";

    $: sections = [
        { title: $t("settings.advanced.debug.device"), data: device },
        { title: $t("settings.advanced.debug.app"), data: app },
        {
            title: $t("settings.advanced.debug.settings"),
            data: $storedSettings,
        },
        { title: $t("settings.advanced.debug.version"), data: $version },
    ];

    let lastCopiedSection: number | null = null;
    let lastCopiedSectionResetTimeout: ReturnType<typeof setTimeout>;

    $: if (lastCopiedSection !== null) {
        lastCopiedSectionResetTimeout = setTimeout(() => {
            lastCopiedSection = null;
        }, 1500);
    }

    onMount(() => {
        if (!$settings.advanced.debug) {
            goto(defaultNavPage("settings"), { replaceState: true });
        }
    });
</script>

{#if $settings.advanced.debug}
    <div id="debug-page">
        {#each sections as { title, data }, i}
            <div id="debug-section-title">
                <h3>{title}</h3>

                <button
                    id="debug-section-copy-button"
                    aria-label={lastCopiedSection === i
                        ? $t("button.copied")
                        : $t("button.copy")}
                    on:click={() => {
                        clearTimeout(lastCopiedSectionResetTimeout);
                        lastCopiedSection = i;
                        copyURL(JSON.stringify(data, null, 2));
                    }}
                >
                    <CopyIcon regularIcon check={lastCopiedSection === i} />
                </button>
            </div>

            <div class="json-block subtext">
                {JSON.stringify(data, null, 2)}
            </div>
        {/each}
    </div>
{/if}

<style>
    #debug-page {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--padding);
    }

    #debug-section-title {
        display: flex;
        flex-direction: start;
        align-items: center;
        gap: 0.4rem;
    }

    #debug-section-copy-button {
        background: transparent;
        padding: 2px;
        box-shadow: none;
        border-radius: 5px;
        transition: opacity 0.2s;
        opacity: 0.7;
    }

    #debug-section-copy-button :global(.copy-animation),
    #debug-section-copy-button :global(.copy-animation *) {
        width: 17px;
        height: 17px;
    }

    .json-block {
        display: flex;
        flex-direction: column;
        line-break: anywhere;
        border-radius: var(--border-radius);
        background: var(--button);
        padding: var(--padding);
        white-space: pre-wrap;
    }
</style>
