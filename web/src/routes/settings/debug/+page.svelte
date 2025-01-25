<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { version } from "$lib/version";
    import { device, app } from "$lib/device";
    import { defaultNavPage } from "$lib/subnav";
    import settings, { storedSettings } from "$lib/state/settings";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import { type Readable, type Unsubscriber } from "svelte/store";

    const stateSubscribers: Record<string, Unsubscriber> = {};
    let states: Record<string, unknown> = {};

    $: sections = [
        { title: "device", data: device },
        { title: "app", data: app },
        { title: "settings", data: $storedSettings },
        { title: "version", data: $version },
        { title: "states", data: states }
    ];

    const loadStates = () => {
        const modules = import.meta.glob("/src/lib/*/*.ts");
        const excluded = new Set(['translations.translations', 'settings']);

        Object.entries(modules).map(async ([ name, _import ]) => {
            const moduleName = name.split('/').pop()?.split('.').shift();

            const module = await _import() as Record<string, unknown>;
            for (const key in module) {
                const _export = module[key] as unknown as Readable<unknown>;
                if (typeof _export === 'object' && 'subscribe' in _export) {
                    const name = moduleName + (key === 'default' ? '' : `.${key}`);
                    if (excluded.has(name)) continue;

                    stateSubscribers[name] = _export.subscribe((value) => {
                        states = {
                            ...states,
                            [name]: value
                        }
                    });
                }
            }
        });
    }

    onMount(() => {
        if (!$settings.advanced.debug) {
            goto(defaultNavPage("settings"), { replaceState: true });
        }

        loadStates();
    });

    onDestroy(() => {
        Object.values(stateSubscribers).map(unsub => unsub());
    })
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
