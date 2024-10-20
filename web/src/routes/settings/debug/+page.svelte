<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { version } from "$lib/version";
    import { device, app } from "$lib/device";
    import { defaultNavPage } from "$lib/subnav";
    import settings, { storedSettings } from "$lib/state/settings";

    import SectionHeading from "$components/misc/SectionHeading.svelte";

    $: sections = [
        { title: "device", data: device },
        { title: "app", data: app },
        { title: "settings", data: $storedSettings },
        { title: "version", data: $version },
    ];

    onMount(() => {
        if (!$settings.advanced.debug) {
            goto(defaultNavPage("settings"), { replaceState: true });
        }
    });
</script>

{#if $settings.advanced.debug}
    <div id="debug-page">
        {#each sections as { title, data }, i}
            <div class="debug-section">
                <SectionHeading
                    sectionId={title}
                    {title}
                    copyData={JSON.stringify(data)}
                />
                <div class="json-block subtext">
                    {JSON.stringify(data, null, 2)}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    #debug-page {
        display: flex;
        flex-direction: column;
        padding: calc(var(--subnav-padding) / 2);
        gap: var(--padding);
    }

    .debug-section {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
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
