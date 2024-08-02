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

<style>
    .popup-button {
        width: 100%;
        height: 40px;
        transition: 0.2s opacity;
    }

    .popup-button.red {
        background-color: var(--red);
        color: var(--white);
    }

    .popup-button[disabled] {
        opacity: 0.6;
    }
</style>
