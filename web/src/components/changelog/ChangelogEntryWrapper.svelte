<!-- Workaround for https://github.com/pngwn/MDsveX/issues/116 -->
<script lang="ts" module>
    import a from "$components/misc/OuterLink.svelte";
    export { a };
</script>

<script lang="ts">
    import ChangelogEntry from "$components/changelog/ChangelogEntry.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        version: string;
        title: string;
        date: string;
        banner?: any;
        children: Snippet;
    }

    const { version, title, date, banner, children }: Props = $props();
</script>

<ChangelogEntry {version} {title} {date} {banner}>
    {@render children?.()}
</ChangelogEntry>
