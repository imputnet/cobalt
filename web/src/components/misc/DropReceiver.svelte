<script lang="ts">
    export let id: string;
    export let classes = "";

    export let draggedOver = false;
    export let file: File | undefined;

    const dropHandler = async (ev: DragEvent) => {
        draggedOver = false;
        ev.preventDefault();

        if (ev?.dataTransfer?.files.length === 1) {
            file = ev.dataTransfer.files[0];
            return file;
        }
    };

    const dragOverHandler = (ev: DragEvent) => {
        draggedOver = true;
        ev.preventDefault();
    };
</script>

<div
    {id}
    class={classes}
    role="region"
    on:drop={(ev) => dropHandler(ev)}
    on:dragover={(ev) => dragOverHandler(ev)}
    on:dragend={() => {
        draggedOver = false;
    }}
    on:dragleave={() => {
        draggedOver = false;
    }}
>
    <slot></slot>
</div>
