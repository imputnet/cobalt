<script lang="ts">
    export let closeFunc: () => void;
</script>

<div
    id="dialog-backdrop-close"
    aria-hidden="true"
    on:click={() => closeFunc()}
></div>

<style>
    #dialog-backdrop-close {
        position: inherit;
        height: 100%;
        width: 100%;
        z-index: -1;
    }
</style>
