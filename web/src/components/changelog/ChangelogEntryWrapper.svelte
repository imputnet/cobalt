<!-- Workaround for https://github.com/pngwn/MDsveX/issues/116 -->
<script lang="ts" context="module">
    import a from "$components/misc/OuterLink.svelte";
    export { a };
</script>

<script lang="ts">
    import ChangelogEntry from "$components/changelog/ChangelogEntry.svelte";
    export let version = '';
    export let title = '';
    export let date = '';
    export let banner = undefined;
</script>

<ChangelogEntry {version} {title} {date} {banner}>
    <slot></slot>
</ChangelogEntry>
