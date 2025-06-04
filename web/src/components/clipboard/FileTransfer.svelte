<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    
    const dispatch = createEventDispatcher();
    
    export let files: File[];
    export let receivedFiles: any[];
    export let sendingFiles: boolean;
    export let receivingFiles: boolean;
    export let transferProgress: number;
    export let dragover: boolean;
    export let peerConnected: boolean;
    
    let fileInput: HTMLInputElement;
    
    function handleFileSelect(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            const newFiles = Array.from(target.files);
            dispatch('filesSelected', { files: newFiles });
        }
    }

    function handleDragOver(event: DragEvent): void {
        event.preventDefault();
        dragover = true;
    }

    function handleDragLeave(): void {
        dragover = false;
    }

    function handleDrop(event: DragEvent): void {
        event.preventDefault();
        dragover = false;
        if (event.dataTransfer?.files) {
            const droppedFiles = Array.from(event.dataTransfer.files);
            dispatch('filesSelected', { files: droppedFiles });
        }
    }

    function removeFile(index: number): void {
        dispatch('removeFile', { index });
    }

    function sendFiles(): void {
        dispatch('sendFiles');
    }

    function downloadReceivedFile(file: any): void {
        dispatch('downloadFile', { file });
    }

    function removeReceivedFile(index: number): void {
        dispatch('removeReceivedFile', { index });
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
</script>

<SettingsCategory title="文件传输" sectionId="file-transfer">
    <div class="file-transfer-section">
        <div class="send-files">
            <h4>发送文件</h4>
            
            <div
                class="file-drop-zone"
                class:dragover
                on:dragover={handleDragOver}
                on:dragleave={handleDragLeave}
                on:drop={handleDrop}
                role="button"
                tabindex="0"
                on:click={() => fileInput?.click()}
                on:keydown={(e) => e.key === 'Enter' && fileInput?.click()}
            >
                <p>📁 拖拽文件到这里或点击选择</p>
                <input
                    bind:this={fileInput}
                    type="file"
                    multiple
                    on:change={handleFileSelect}
                    style="display: none;"
                />
            </div>

            {#if files.length > 0}
                <div class="file-list">
                    <h5>待发送文件:</h5>
                    {#each files as file, index (file.name + index)}
                        <div class="file-item">
                            <span class="file-name">{file.name}</span>
                            <span class="file-size">({formatFileSize(file.size)})</span>
                            <button
                                class="remove-file"
                                on:click={() => removeFile(index)}
                                aria-label="Remove file"
                            >
                                ❌
                            </button>
                        </div>
                    {/each}
                      <ActionButton
                        id="send-files"
                        disabled={!peerConnected || sendingFiles}
                        click={sendFiles}
                    >
                        {sendingFiles ? '发送中...' : '发送文件'}
                    </ActionButton>
                </div>
            {/if}

            {#if sendingFiles}
                <div class="progress-section">
                    <h4>发送进度: {Math.round(transferProgress)}%</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {transferProgress}%"></div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="received-files">
            <h4>已接收文件</h4>
            
            {#if receivingFiles}
                <div class="progress-section">
                    <h4>接收进度: {Math.round(transferProgress)}%</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {transferProgress}%"></div>
                    </div>
                </div>
            {/if}
            
            {#if receivedFiles.length > 0}
                <div class="file-list">
                    {#each receivedFiles as file, index (file.name + index)}
                        <div class="file-item">
                            <span class="file-name">{file.name}</span>
                            <span class="file-size">({formatFileSize(file.size)})</span>
                            <div class="file-actions">
                                <button
                                    class="download-btn"
                                    on:click={() => downloadReceivedFile(file)}
                                >
                                    📥 下载
                                </button>
                                <button
                                    class="remove-file"
                                    on:click={() => removeReceivedFile(index)}
                                    aria-label="Remove file"
                                >
                                    ❌
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else if !receivingFiles}
                <div class="empty-state">
                    暂无接收到的文件
                </div>
            {/if}
        </div>
    </div>
</SettingsCategory>

<style>
    .file-transfer-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .send-files, .received-files {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .file-drop-zone {
        border: 2px dashed var(--border);
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        transition: all 0.2s ease;
        background-color: var(--background);
        cursor: pointer;
    }

    .file-drop-zone:hover {
        border-color: var(--accent);
        background-color: var(--accent-background);
    }

    .file-drop-zone.dragover {
        border-color: var(--accent);
        background-color: var(--accent-background);
        transform: scale(1.02);
    }

    .file-drop-zone p {
        margin-bottom: 1rem;
        color: var(--secondary);
    }

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: var(--background-alt);
        border-radius: 0.25rem;
        border: 1px solid var(--border);
    }

    .file-name {
        flex: 1;
        font-weight: 500;
        color: var(--text);
    }

    .file-size {
        color: var(--secondary);
        font-size: 0.9rem;
    }

    .file-actions {
        display: flex;
        gap: 0.5rem;
    }

    .download-btn {
        background-color: var(--accent-background);
        border: 1px solid var(--accent);
        color: var(--accent);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }

    .download-btn:hover {
        background-color: var(--accent);
        color: var(--background);
    }

    .remove-file {
        background: none;
        border: none;
        color: var(--red);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }

    .remove-file:hover {
        background-color: var(--red-background);
    }

    .progress-section {
        margin-top: 1rem;
        padding: 1rem;
        background-color: var(--background-alt);
        border-radius: 0.5rem;
        border: 1px solid var(--border);
    }

    .progress-section h4 {
        margin: 0 0 0.5rem 0;
        color: var(--text);
        font-size: 0.9rem;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: var(--border);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--accent);
        transition: width 0.3s ease;
    }

    .empty-state {
        text-align: center;
        color: var(--secondary);
        font-style: italic;
        padding: 2rem;
        border: 1px dashed var(--border);
        border-radius: 0.5rem;
        background-color: var(--background-alt);
    }

    @media (max-width: 768px) {
        .file-transfer-section {
            gap: 1.5rem;
        }
        
        .file-drop-zone {
            padding: 1.5rem 1rem;
        }

        .file-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
        }

        .file-actions {
            align-self: flex-end;
        }
    }
</style>
