<script lang="ts">
    export let settingId: string;
</script>

<div id="switcher-{settingId}" class="switcher">
    <slot></slot>
</div>

<style>
    .switcher {
        display: flex;
        width: auto;
        flex-direction: row;
        flex-wrap: nowrap;
        scrollbar-width: none;
        overflow-x: scroll;
    }

    .switcher :global(.button:first-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .switcher :global(.button:last-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .switcher > :global(:not(.button:first-child):not(.button:last-child)) {
        border-radius: 0;
    }

    .switcher > :global(:not(.button:first-child)) {
        margin-left: -1.5px; /* hack to get rid of double border in a list of switches */
    }
</style>
