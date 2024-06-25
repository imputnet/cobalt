<script lang="ts">
    export let title: string;
    export let description: string = "";
</script>

<div class="settings-content">
    <h3 class="settings-content-title">{title}</h3>
    <slot></slot>

    {#if description.length > 0}
        <div class="settings-content-description subtext">{description}</div>
    {/if}
</div>

<style>
    .settings-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>
