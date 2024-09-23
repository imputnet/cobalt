<!-- Workaround for https://github.com/pngwn/MDsveX/issues/116 -->
<script lang="ts" context="module">
    import a from "$components/misc/OuterLink.svelte";
    export { a };
</script>

<div class="long-text-noto about">
    <slot></slot>
</div>
