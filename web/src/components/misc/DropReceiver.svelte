<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        id: string;
        draggedOver?: boolean;
        files: FileList | undefined;
        onDrop: () => {};
        children?: Snippet;
    };

    let {
        id,
        draggedOver = $bindable(false),
        files = $bindable(),
        onDrop,
        children,
    }: Props = $props();

    const dropHandler = async (ev: DragEvent) => {
        draggedOver = false;
        ev.preventDefault();

        if (ev?.dataTransfer?.files && ev?.dataTransfer?.files.length > 0) {
            files = ev.dataTransfer.files;
            onDrop();
        }
    };

    const dragOverHandler = (ev: DragEvent) => {
        draggedOver = true;
        ev.preventDefault();
    };
</script>

<div
    {id}
    role="region"
    ondrop={(ev) => dropHandler(ev)}
    ondragover={(ev) => dragOverHandler(ev)}
    ondragend={() => {
        draggedOver = false;
    }}
    ondragleave={() => {
        draggedOver = false;
    }}
>
    {@render children?.()}
</div>
