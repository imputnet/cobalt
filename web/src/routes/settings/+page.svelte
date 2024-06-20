<script lang="ts"> 
    import SettingsButton from "../../components/buttons/SettingsButton.svelte";
    import SettingsCheckbox from "../../components/buttons/SettingsCheckbox.svelte";
    import Switcher from "../../components/buttons/Switcher.svelte";

    import { merge } from 'ts-deepmerge';
    import defaultSettings, { settingArrays } from "$lib/settings/defaults";

    const switchers = merge(defaultSettings, settingArrays);
</script>

<div>
    <div>settings (placeholder)</div>
    <br>
    {#each Object.entries(switchers) as [context, settingIdParent]}
        <div>
            <div>{context} context:</div>
            <br>
        </div>
        {#each Object.entries(settingIdParent) as [settingId, settingValue]}
            {#if settingValue instanceof Array}
                <div>{settingId}</div>
                <Switcher>
                    {#each settingValue as value}
                        <SettingsButton settingContext="{context}" settingId="{settingId}" settingKey="{value}">
                            {value}
                        </SettingsButton>
                    {/each}
                </Switcher>
                <br>
            {/if}

            {#if typeof settingValue === "boolean"}
                <SettingsCheckbox settingContext={context} settingId="{settingId}">
                    {settingId}
                </SettingsCheckbox>
                <br>
            {/if}
        {/each}
    {/each}
</div>
