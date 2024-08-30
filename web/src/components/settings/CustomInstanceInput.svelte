<script lang="ts">
    import { get } from "svelte/store";
    import { t } from "$lib/i18n/translations";

    import settings, { updateSetting } from "$lib/state/settings";
    import { customInstanceWarning } from "$lib/api/safety-warning";

    let inputValue = get(settings).processing.customInstanceURL;

    let url: string;
    let validUrl: boolean;

    const checkUrl = () => {
        try {
            let test = /^https:/i.test(new URL(inputValue).protocol);
            if (test) url = new URL(inputValue).origin.toString();
            validUrl = true;
        } catch {
            validUrl = false;
        }
    };

    const writeInput = () => {
        let url;
        try {
            url = new URL(inputValue).origin.toString();
        } catch {
            return (validUrl = false);
        }
        updateSetting({
            processing: {
                customInstanceURL: url,
            },
        });
        inputValue = get(settings).processing.customInstanceURL;
    };
</script>

<input
    id="link-area"
    bind:value={inputValue}
    on:input={() => {
        checkUrl();
    }}
    spellcheck="false"
    autocomplete="off"
    autocapitalize="off"
    maxlength="128"
    placeholder="instance url"
/>

<button
    id="instance-save"
    disabled={inputValue == $settings.processing.customInstanceURL || !validUrl}
    on:click={async () => {
        await customInstanceWarning();
        if ($settings.processing.seenCustomWarning) {
            if (inputValue) writeInput();
        }
    }}
>
    {$t("button.save")}
</button>

{#if $settings.processing.customInstanceURL.length > 0}
    <button
        id="instance-reset"
        on:click={() => {
            updateSetting({
                processing: {
                    customInstanceURL: "",
                },
            });
            inputValue = get(settings).processing.customInstanceURL;
        }}
    >
        {$t("button.reset")}
    </button>
{/if}

<style>
    #instance-save[disabled] {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
