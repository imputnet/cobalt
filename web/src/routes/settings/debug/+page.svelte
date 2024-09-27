<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import ActionButton from "$components/buttons/ActionButton.svelte";
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

    let lastCopiedSection = -1;
    let lastCopiedSectionResetTimeout: ReturnType<typeof setTimeout>;

    $: if (lastCopiedSection) {
        lastCopiedSectionResetTimeout = setTimeout(() => {
            lastCopiedSection = -1;
        }, 1500);
    }

    onMount(() => {
        if (!$settings.advanced.debug) {
            goto(defaultNavPage("settings"), { replaceState: true });
        }
    });
</script>

{#if $settings.advanced.debug}
    <div id="advanced-page">
        {#each sections as { title, data }, i}
            <h3>{title}:</h3>
            <div class="message-container subtext">
                {JSON.stringify(data, null, 2)}
            </div>
            <ActionButton
                id="copy-button"
                click={() => {
                    clearTimeout(lastCopiedSectionResetTimeout);
                    lastCopiedSection = i;
                    copyURL(JSON.stringify(data, null, 2));
                }}
            >
                <CopyIcon />
                {lastCopiedSection === i
                    ? $t("button.copied")
                    : $t("button.copy")}
            </ActionButton>
        {/each}
    </div>
{/if}

<style>
    #advanced-page {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--padding);
    }

    .message-container {
        display: flex;
        flex-direction: column;
        line-break: anywhere;
        border-radius: var(--border-radius);
        background: var(--button);
        padding: var(--padding);
        white-space: pre-wrap;
    }
</style>
