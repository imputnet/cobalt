<script lang="ts">
    export let id: string;
    export let text: string = "Button";
    export let click = () => { alert('no function assigned') };
</script>

<button id={id} on:click={click}>
    <slot></slot>
    {text}
</button>
