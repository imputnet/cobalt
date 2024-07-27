<script lang="ts">
    import type { DialogButton } from "$lib/types/dialog";

    export let buttons: DialogButton[];
    export let closeFunc: () => void;
</script>

<div class="popup-buttons">
    {#each buttons as button}
        <button
            class="button elevated popup-button {button.color}"
            class:color={button.color}
            class:active={button.main}
            on:click={async () => {
                await button.action();
                closeFunc();
            }}
        >
            {button.text}
        </button>
    {/each}
</div>

<style>
    .popup-buttons {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: calc(var(--padding) / 2);
        overflow: scroll;
        border-radius: var(--border-radius);
        min-height: 40px;
    }

    .popup-button {
        width: 100%;
        height: 40px;
    }

    .popup-button.red {
        background-color: var(--red);
        color: var(--white);
    }
</style>
