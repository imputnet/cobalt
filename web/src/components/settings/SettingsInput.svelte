<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CobaltSettings, 'schemaVersion'>,
        Id extends keyof CobaltSettings[Context]
    "
>
    import { get } from "svelte/store";
    import { t } from "$lib/i18n/translations";
    import type { CobaltSettings } from "$lib/types/settings";

    import settings, { updateSetting } from "$lib/state/settings";
    import { customInstanceWarning } from "$lib/api/safety-warning";

    import IconX from "@tabler/icons-svelte/IconX.svelte";
    import IconCheck from "@tabler/icons-svelte/IconCheck.svelte";

    export let settingId: Id;
    export let settingContext: Context;
    export let placeholder: string;
    export let altText: string;
    export let type: "url" | "uuid" = "url";
    export let showInstanceWarning = false;

    const regex = {
        url: "https?:\\/\\/[a-z0-9.\\-]+(:\\d+)?/?",
        uuid: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    };

    let input: HTMLInputElement;
    let inputValue: string = String(get(settings)[settingContext][settingId]);
    let inputFocused = false;
    let validInput = false;

    const writeToSettings = (value: string, type: "url" | "uuid" | "text") => {
        updateSetting({
            [settingContext]: {
                [settingId]:
                    type === "url" ? new URL(value).origin.toString() : value,
            },
        });
        inputValue = String(get(settings)[settingContext][settingId]);
    };

    const save = async () => {
        if (showInstanceWarning) {
            await customInstanceWarning();

            if ($settings.processing.seenCustomWarning && inputValue) {
                return writeToSettings(inputValue, type);
            }

            return;
        }

        return writeToSettings(inputValue, type);
    };
</script>

<div id="settings-input-holder">
    <div id="input-container" class:focused={inputFocused} aria-hidden="false">
        <input
            id="input-box"
            bind:this={input}
            bind:value={inputValue}
            on:input={() => (validInput = input.checkValidity())}
            on:input={() => (inputFocused = true)}
            on:focus={() => (inputFocused = true)}
            on:blur={() => (inputFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="64"
            pattern={regex[type]}
            aria-label={altText}
            aria-hidden="false"
        />

        {#if inputValue.length === 0}
            <span class="input-placeholder" aria-hidden="true">
                {placeholder}
            </span>
        {/if}
    </div>

    <div id="settings-input-buttons">
        <button
            class="settings-input-button"
            aria-label={$t("button.save")}
            disabled={inputValue == $settings[settingContext][settingId] || !validInput}
            on:click={save}
        >
            <IconCheck />
        </button>

        <button
            class="settings-input-button"
            aria-label={$t("button.reset")}
            disabled={String($settings[settingContext][settingId]).length <= 0}
            on:click={() => writeToSettings("", "text")}
        >
            <IconX />
        </button>
    </div>
</div>

<style>
    #settings-input-holder {
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
        position: relative;
        overflow: hidden;
    }

    #input-container,
    #input-box {
        font-size: 13.5px;
        font-weight: 500;
        min-width: 0;
    }

    #input-box {
        flex: 1;
        background-color: transparent;
        color: var(--secondary);
        border: none;
        padding-block: 0;
        padding-inline: 0;
        padding: 12px 0;
    }

    #input-box::placeholder {
        color: var(--gray);
        /* fix for firefox */
        opacity: 1;
    }

    .input-placeholder {
        position: absolute;
        color: var(--gray);
        pointer-events: none;
        white-space: nowrap;
    }

    #input-box:focus-visible {
        box-shadow: unset !important;
    }

    #input-container.focused {
        box-shadow: 0 0 0 2px var(--secondary) inset;
    }

    #settings-input-buttons {
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    .settings-input-button {
        height: 42px;
        width: 42px;
        padding: 0;
    }

    .settings-input-button :global(svg) {
        height: 21px;
        width: 21px;
        stroke-width: 1.5px;
    }

    .settings-input-button[disabled] {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
