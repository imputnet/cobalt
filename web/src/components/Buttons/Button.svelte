<script>
    export let id;
    export let text = "Button";
    export let click = () => { alert('clicked') };
</script>

<style>
    :global(button) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 7px 13px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: var(--button);
        color: var(--accent);
    }
    :global(button:hover) {
        background-color: var(--button-hover);
    }
</style>

<button id={id} on:click={click}>
    {text}
</button>