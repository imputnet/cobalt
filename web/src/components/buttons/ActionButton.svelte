<script lang="ts">
    export let id: string;
    export let click = () => {
        alert("no function assigned");
    };
</script>

<button id="button-{id}" class="button" on:click={click}>
    <slot></slot>
</button>
