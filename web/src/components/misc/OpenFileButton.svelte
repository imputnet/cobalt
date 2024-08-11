<script lang="ts">
    export let file: File;
    export let draggedOver = false;

    const openFile = async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "video/*,audio/*";

        fileInput.click();

        fileInput.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;

            if (target.files?.length === 1) {
                file = target.files[0];
                return file;
            }
        };
    };
</script>

<button on:click={() => openFile()}>
    {#if draggedOver}
        drop the file!
    {:else}
        open the file
    {/if}
</button>
