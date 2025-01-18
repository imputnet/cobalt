<script lang="ts">
    export let id: string;
    export let classes = "";

    export let draggedOver = false;
    export let files: FileList | undefined;

    const dropHandler = async (ev: DragEvent) => {
        draggedOver = false;
        ev.preventDefault();

        if (ev?.dataTransfer?.files && ev?.dataTransfer?.files.length > 0) {
            files = ev.dataTransfer.files;
            return files;
        }
    };

    const dragOverHandler = (ev: DragEvent) => {
        console.log("dragged over omg")
        draggedOver = true;
        ev.preventDefault();
    };
</script>

<div
    {id}
    class={classes}
    role="region"
    aria-hidden="true"
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
