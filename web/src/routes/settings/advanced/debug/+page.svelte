<script lang="ts">
    import { device, app } from "$lib/device";
    import { version } from "$lib/version";
</script>

<div id="advanced-page">
    device:
    <div class="message-container subtext">
        is.iPad: {device.is.iPad}
        is.iPhone: {device.is.iPhone}
        is.iOS: {device.is.iOS}
        is.android: {device.is.android}
        is.mobile: {device.is.mobile}
        preferredLocale: {device.preferredLocale}
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

<style>
    #advanced-page {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--padding)
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
