<script lang="ts">
    export let id: string;
    export let click = () => {
        alert("no function assigned");
    };
    export let disabled: boolean = false;
</script>

<button id="button-{id}" class="button" {disabled} on:click={click}>
    <slot></slot>
</button>
