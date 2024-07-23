<script lang="ts">
    import ActionButton from "$components/buttons/ActionButton.svelte";
    import IconFileExport from "@tabler/icons-svelte/IconFileExport.svelte";
    import IconFileImport from "@tabler/icons-svelte/IconFileImport.svelte";
    import settings, { updateSetting, loadFromString } from "$lib/state/settings";

    const importSettings = () => {
        const pseudoinput = document.createElement('input');
        pseudoinput.type = 'file';
        pseudoinput.accept = '.json';
        pseudoinput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const reader = new FileReader();

            reader.onload = function() {
                try {
                    const data = reader.result?.toString();
                    if (!data) {
                        throw "data is missing";
                    }

                    // TODO: input is not validated at all here, which means
                    //       someone can potentially import a broken config.
                    //       i don't know if we should do something about it
                    //       or just thug it out.
                    updateSetting(
                        loadFromString(data)
                    );
                } catch(e) {
                    alert(e);
                }
            }

            if (target.files?.length === 1) {
                reader.readAsText(target.files[0]);
            } else alert('file missing');
        };
        pseudoinput.click();
    }

    const exportSettings = () => {
        const blob = new Blob(
            [ JSON.stringify($settings, null, 2) ],
            { type: 'application/json' }
        );

        const pseudolink = document.createElement('a');
        pseudolink.href = URL.createObjectURL(blob);
        pseudolink.download = 'settings.json';
        pseudolink.click();
    }
</script>

<div class="button-row" id="settings-data-transfer">
    <ActionButton id="import-settings" click={importSettings}>
        <IconFileImport /> import
    </ActionButton>
    <ActionButton id="export-settings" click={exportSettings}>
        <IconFileExport /> export
    </ActionButton>
</div>

<style>
    .button-row {
        display: flex;
        gap: var(--padding);
    }
</style>