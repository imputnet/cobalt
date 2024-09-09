<script lang="ts">
    export let href: string;

    // rel is passed by MDsveX, but we don't need it, so we just ignore it
    // no way to change this behavior atm (https://github.com/pngwn/MDsveX/issues/609)
    export let rel: string = "";
    rel;

    const [ target, _rel ] = (() => {
        try {
            new URL(href)
            return [ '_blank', 'noopener noreferrer' ];
        } catch {}

        return [];
    })();
</script>

<a rel={_rel} {target} {href}>
    <slot></slot>
</a>
