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
    export let type: "url" | "uuid" = "url";

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    let inputValue: string = String(get(settings)[settingContext][settingId]);
    let inputFocused = false;

    let validInput: boolean;

    const checkInput = () => {
        try {
            if (type === "uuid") {
                const regex = UUID_REGEX.test(inputValue);
                if (!regex) throw new Error("invalid uuid");
            } else {
                new URL(inputValue).origin.toString();
            }
            validInput = true;
        } catch {
            validInput = false;
        }
    };

    const writeInput = () => {
        let input;
        try {
            if (type === "uuid") {
                const regex = UUID_REGEX.test(inputValue);
                if (regex) input = inputValue.toString();
            } else {
                input = new URL(inputValue).origin.toString();
            }
        } catch {
            validInput = false;
            return;
        }

        updateSetting({
            [settingContext]: {
                [settingId]: input,
            },
        });
        inputValue = String(get(settings)[settingContext][settingId]);
    };

    const reset = () => {
        updateSetting({
            [settingContext]: {
                [settingId]: "",
            },
        });
        inputValue = String(get(settings)[settingContext][settingId]);
    }

    const save = async () => {
        await customInstanceWarning();
        if ($settings.processing.seenCustomWarning && inputValue) {
            writeInput();
        }
    }
</script>

<div id="settings-input-holder">
    <div id="input-container" class:focused={inputFocused}>
        <input
            id="input-box"
            bind:value={inputValue}
            on:input={() => checkInput()}
            on:input={() => (inputFocused = true)}
            on:focus={() => (inputFocused = true)}
            on:blur={() => (inputFocused = false)}
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            maxlength="64"
            {placeholder}
        />
    </div>

    <div id="settings-input-buttons">
        <button
            class="settings-input-button"
            aria-label={$t("button.save")}
            disabled={
                inputValue == $settings[settingContext][settingId] || !validInput
            }
            on:click={save}
        >
            <IconCheck />
        </button>

        <button
            class="settings-input-button"
            aria-label={$t("button.reset")}
            disabled={String($settings[settingContext][settingId]).length <= 0}
            on:click={() => reset()}
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
