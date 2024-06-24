<script lang="ts"> 
    import SettingsButton from "../../components/buttons/SettingsButton.svelte";
    import SettingsCheckbox from "../../components/buttons/SettingsCheckbox.svelte";
    import Switcher from "../../components/buttons/Switcher.svelte";

    import { merge } from 'ts-deepmerge';
    import defaultSettings, { settingArrays } from "$lib/settings/defaults";

    const switchers = merge(defaultSettings, settingArrays);
</script>

<div>
</div>
