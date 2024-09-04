<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import { version } from "$lib/version";
    import { device, app } from "$lib/device";
    import { defaultNavPage } from "$lib/subnav";
    import settings, { storedSettings } from "$lib/state/settings";

    onMount(() => {
        if (!$settings.advanced.debug) {
            goto(defaultNavPage("settings"), { replaceState: true });
        }
    });
</script>

{#if $settings.advanced.debug}
    <div id="advanced-page">
        <h3>device:</h3>
        <div class="message-container subtext">
            {JSON.stringify(device, null, 2)}
        </div>

        <h3>app:</h3>
        <div class="message-container subtext">
            {JSON.stringify(app, null, 2)}
        </div>

        <h3>settings:</h3>
        <div class="message-container subtext">
            {JSON.stringify($storedSettings, null, 2)}
        </div>

        <h3>version:</h3>
        <div class="message-container subtext">
            {JSON.stringify($version, null, 2)}
        </div>
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
