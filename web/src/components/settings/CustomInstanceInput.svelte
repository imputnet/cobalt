<script lang="ts">
    import { get } from "svelte/store";
    import { t } from "$lib/i18n/translations";

    import settings, { updateSetting } from "$lib/state/settings";
    import { customInstanceWarning } from "$lib/api/safety-warning";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";

    let inputValue = get(settings).processing.customInstanceURL;
    let inputFocused = false;

    let url: string;
    let validUrl: boolean;

    const checkUrl = () => {
        try {
            url = new URL(inputValue).origin.toString();
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

<div id="custom-instance-holder">
    <div id="input-container" class:focused={inputFocused}>
        <input
            id="custom-instance-input"
            bind:value={inputValue}
            on:input={() => {
                checkUrl();
                inputFocused = true;
            }}
            on:input={() => (inputFocused = true)}
            on:focus={() => (inputFocused = true)}
            on:blur={() => (inputFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="64"
            placeholder={$t("settings.processing.custom.placeholder")}
        />
    </div>
    <div id="custom-instance-buttons">
        <button
            id="instance-save"
            class="custom-instance-button"
            aria-label={$t("button.save")}
            disabled={inputValue == $settings.processing.customInstanceURL ||
                !validUrl}
            on:click={async () => {
                await customInstanceWarning();
                if ($settings.processing.seenCustomWarning) {
                    if (inputValue) writeInput();
                }
            }}
        >
            <IconCheck />
        </button>

        <button
            id="instance-reset"
            class="custom-instance-button"
            aria-label={$t("button.reset")}
            disabled={$settings.processing.customInstanceURL.length <= 0}
            on:click={() => {
                updateSetting({
                    processing: {
                        customInstanceURL: "",
                    },
                });
                inputValue = get(settings).processing.customInstanceURL;
            }}
        >
            <IconX />
        </button>
    </div>
</div>

<style>
    #custom-instance-holder {
        display: flex;
        gap: 6px;
    }

    #input-container {
        padding: 0 18px;
        border-radius: var(--border-radius);
        color: var(--secondary);
        background-color: var(--button);
        box-shadow: var(--button-box-shadow);
        display: flex;
        align-items: center;
        width: 100%;
    }

    #input-container,
    #custom-instance-input {
        font-size: 13.5px;
        font-weight: 500;
        min-width: 0;
    }

    #custom-instance-input {
        flex: 1;
        background-color: transparent;
        color: var(--secondary);
        border: none;
        padding-block: 0;
        padding-inline: 0;
        padding: 12px 0;
    }

    #custom-instance-input::placeholder {
        color: var(--gray);
        /* fix for firefox */
        opacity: 1;
    }

    #custom-instance-input:focus-visible {
        box-shadow: unset !important;
    }

    #input-container.focused {
        box-shadow: 0 0 0 2px var(--secondary) inset;
    }

    #custom-instance-buttons {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    .custom-instance-button {
        height: 42px;
        width: 42px;
        padding: 0;
    }

    .custom-instance-button :global(svg) {
        height: 21px;
        width: 21px;
        stroke-width: 1.5px;
    }

    .custom-instance-button[disabled] {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
