<script lang="ts">
    import { device, app } from "$lib/device";
    import { version } from "$lib/version";
    import settings from "$lib/settings";

    import { goto } from "$app/navigation";
    import { defaultSettingsPage } from "$lib/settings/defaults";

    $: {
        if (!$settings.advanced.debug) {
            goto(defaultSettingsPage(), { replaceState: true });
        }
    }
</script>

{#if $settings.advanced.debug}
    <div id="advanced-page">
        device:
        <div class="message-container subtext">
            is.iPad: {device.is.iPad}
            is.iPhone: {device.is.iPhone}
            is.iOS: {device.is.iOS}
            is.android: {device.is.android}
            is.mobile: {device.is.mobile}
            preferredLocale: {device.preferredLocale}
            userAgent: {device.userAgent}
        </div>

        app:
        <div class="message-container subtext">
            is.installed: {app.is.installed}
        </div>

        version:
        <div class="message-container subtext">
            version: {version.version}
            commit: {version.commit.slice(0, 7)}
            branch: {version.branch}
            remote: {version.remote}
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
    }
</style>
