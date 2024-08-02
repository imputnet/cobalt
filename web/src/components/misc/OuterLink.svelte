<script lang="ts">
    export let href: string;

    // rel is passed by MDsveX, but we don't need it, so we just ignore it
    // no way to change this behavior atm (https://github.com/pngwn/MDsveX/issues/609)
    export let rel: string = "";
    rel;
</script>

<a target="_blank" rel="noopener noreferrer" {href}>
    <slot></slot>
</a>
