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
    import IconArrowBack from "@tabler/icons-svelte/IconArrowBack.svelte";

    import IconEye from "@tabler/icons-svelte/IconEye.svelte";
    import IconEyeClosed from "@tabler/icons-svelte/IconEyeClosed.svelte";

    type SettingsInputType = "url" | "uuid";

    export let settingId: Id;
    export let settingContext: Context;
    export let placeholder: string;
    export let altText: string;
    export let type: "url" | "uuid" = "url";

    export let sensitive = false;
    export let showInstanceWarning = false;

    const regex = {
        url: "https?:\\/\\/[a-z0-9.\\-]+(:\\d+)?/?",
        uuid: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    };

    let input: HTMLInputElement;
    let inputValue: string = String(get(settings)[settingContext][settingId]);
    let inputFocused = false;
    let validInput = false;

    let inputHidden = true;

    $: inputType = sensitive && inputHidden ? "password" : "text";

    const checkInput = () => {
        validInput = input.checkValidity() || inputValue === "";
    }

    const writeToSettings = (value: string, type: SettingsInputType) => {
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

            if ($settings.processing.seenCustomWarning) {
                // allow writing empty strings
                return writeToSettings(inputValue, inputValue ? type : "uuid");
            }

            return;
        }

        return writeToSettings(inputValue, type);
    };
</script>

<div id="settings-input-holder">
    <div
        id="input-container"
        class:focused={inputFocused}
        aria-hidden="false"
    >
        <input
            id="input-box"
            bind:this={input}
            bind:value={inputValue}
            on:input={() => {
                inputFocused = true;
                checkInput();
            }}
            on:focus={() => (inputFocused = true)}
            on:blur={() => (inputFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="64"
            pattern={regex[type]}
            aria-label={altText}
            aria-hidden="false"
            {...{ type: inputType }}
        />

        {#if inputValue.length > 0}
            <button
                class="input-inner-button"
                on:click={() => {
                    inputValue = "";
                    checkInput();
                }}
                aria-label={$t("button.clear_input")}
            >
                <IconX />
            </button>

            {#if sensitive}
                <button
                    class="input-inner-button"
                    on:click={() => (inputHidden = !inputHidden)}
                    aria-label={$t(
                        inputHidden ? "button.show_input" : "button.hide_input"
                    )}
                >
                    {#if inputHidden}
                        <IconEye />
                    {:else}
                        <IconEyeClosed />
                    {/if}
                </button>
            {/if}
        {/if}

        {#if inputValue.length === 0}
            <span class="input-placeholder" aria-hidden="true">
                {placeholder}
            </span>

            {#if String($settings[settingContext][settingId]).length > 0}
                <button
                    class="input-inner-button"
                    on:click={() => {
                        inputValue = String($settings[settingContext][settingId]);
                        checkInput();
                    }}
                    aria-label={$t("button.restore_input")}
                >
                    <IconArrowBack />
                </button>
            {/if}
        {/if}
    </div>

    <div id="settings-input-buttons">
        <button
            class="settings-input-button"
            aria-label={$t("button.save")}
            disabled={inputValue === $settings[settingContext][settingId] || !validInput}
            on:click={save}
        >
            <IconCheck />
        </button>
    </div>
</div>

<style>
    #settings-input-holder {
        display: flex;
        gap: 6px;
    }

    #input-container {
        padding: 0 16px;
        padding-right: 4px;
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
        stroke-width: 1.8px;
    }

    .settings-input-button[disabled] {
        opacity: 0.5;
        pointer-events: none;
    }

    .input-inner-button {
        height: 34px;
        width: 34px;
        padding: 0;
        box-shadow: none;
        /* 4px is padding outside of the button */
        border-radius: calc(var(--border-radius) - 4px);
    }

    .input-inner-button :global(svg) {
        height: 18px;
        width: 18px;
        stroke-width: 1.8px;
    }

    :global(svg) {
        will-change: transform;
    }
</style>
