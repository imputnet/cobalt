<script lang="ts">
    import { onDestroy } from "svelte";
    import type { DialogButton } from "$lib/types/dialog";

    export let button: DialogButton;
    export let closeFunc: () => void;

    let disabled = false;
    let seconds = 0;

    if (button.timeout) {
        disabled = true;
        seconds = Math.round(button.timeout / 1000);

        let interval = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(interval);
                disabled = false;
            }
        }, 1000);

        onDestroy(() => clearInterval(interval));
    }
</script>
{#if button.link}
    <a
        class="button elevated link-button"
        class:color={button.color}
        class:active={button.main}
        href={button.link}
    >
        {button.text}
    </a>
{:else}
    <button
        class="button elevated popup-button {button.color}"
        class:color={button.color}
        class:active={button.main}
        {disabled}
        on:click={async () => {
            await button.action();
            closeFunc();
        }}
    >
        {button.text}{seconds ? ` (${seconds})` : ""}
    </button>
{/if}
<style>
    .link-button {
        text-decoration: none;
        font-weight: 500;
        width: 100%;
        background: var(--glass-bg-light);
        border: 1px solid var(--glass-border-light);
        transition: all 0.25s ease;
    }

    .link-button:hover {
        background: var(--button-hover);
        border-color: rgba(249, 115, 22, 0.3);
    }

    .popup-button {
        width: 100%;
        height: 42px;
        transition: all 0.25s ease;
        background: var(--glass-bg-light);
        border: 1px solid var(--glass-border-light);
    }

    .popup-button:hover {
        background: var(--button-hover);
        border-color: rgba(249, 115, 22, 0.3);
        box-shadow: 0 0 20px rgba(249, 115, 22, 0.15);
    }

    .popup-button.active,
    .link-button.active {
        background: var(--gradient-orange);
        border-color: transparent;
        box-shadow: 0 0 24px rgba(249, 115, 22, 0.4);
    }

    .popup-button.active:hover,
    .link-button.active:hover {
        box-shadow: 0 0 32px rgba(249, 115, 22, 0.5);
    }

    .popup-button.red {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: var(--white);
        border-color: transparent;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    }

    .popup-button.red:hover {
        box-shadow: 0 0 28px rgba(239, 68, 68, 0.4);
    }

    .popup-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
