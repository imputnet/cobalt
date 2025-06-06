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
        gap: 2.5rem;
        padding: 1rem;
    }

    .send-files, .received-files {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
    }

    .send-files:hover, .received-files:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .send-files h4, .received-files h4 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .file-drop-zone {
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 3rem 2rem;
        text-align: center;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .file-drop-zone::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
        transition: left 0.5s ease;
    }

    .file-drop-zone:hover {
        border-color: rgba(102, 126, 234, 0.4);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }

    .file-drop-zone:hover::before {
        left: 100%;
    }

    .file-drop-zone.dragover {
        border-color: rgba(102, 126, 234, 0.6);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        transform: scale(1.02);
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.25);
    }

    .file-drop-zone p {
        margin-bottom: 1rem;
        color: var(--secondary);
        font-size: 1.1rem;
        font-weight: 500;
        position: relative;
        z-index: 1;
    }

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .file-list h5 {
        margin: 0 0 1rem 0;
        font-weight: 600;
        color: var(--text);
        font-size: 0.95rem;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
    }

    .file-item:hover {
        transform: translateY(-1px);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .file-name {
        flex: 1;
        font-weight: 500;
        color: var(--text);
        word-break: break-all;
    }

    .file-size {
        color: var(--secondary);
        font-size: 0.9rem;
        font-weight: 400;
    }

    .file-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .download-btn {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border: 1px solid rgba(102, 126, 234, 0.2);
        color: #667eea;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
    }

    .download-btn:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border-color: rgba(102, 126, 234, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .remove-file {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.2);
        color: #f44336;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        backdrop-filter: blur(4px);
    }

    .remove-file:hover {
        background: rgba(244, 67, 54, 0.2);
        border-color: rgba(244, 67, 54, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
    }

    .progress-section {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(4px);
    }

    .progress-section h4 {
        margin: 0 0 1rem 0;
        color: var(--text);
        font-size: 1rem;
        font-weight: 600;
    }

    .progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
        border-radius: 6px;
        position: relative;
    }

    .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
            transparent 25%, 
            rgba(255, 255, 255, 0.2) 25%, 
            rgba(255, 255, 255, 0.2) 50%, 
            transparent 50%, 
            transparent 75%, 
            rgba(255, 255, 255, 0.2) 75%);
        background-size: 20px 20px;
        animation: progress-stripes 1s linear infinite;
    }

    @keyframes progress-stripes {
        0% { background-position: 0 0; }
        100% { background-position: 20px 0; }
    }

    .empty-state {
        text-align: center;
        color: var(--secondary);
        font-style: italic;
        padding: 3rem 2rem;
        border: 2px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
        transition: all 0.3s ease;
    }

    .empty-state:hover {
        border-color: rgba(255, 255, 255, 0.2);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    }    @media (max-width: 768px) {
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
    }    /* PC/Desktop 优化 - 1024px 及以上 */
    @media (min-width: 1024px) {
        .file-transfer-section {
            gap: 2rem;
            padding: 0.5rem;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .send-files, .received-files {
            padding: 1.5rem;
        }
        
        .file-list {
            max-height: 250px;
            overflow-y: auto;
        }
        
        /* 优化PC端文件列表滚动条 */
        .file-list::-webkit-scrollbar {
            width: 6px;
        }
        
        .file-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 3px;
        }
        
        .file-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        .file-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* 优化整体区域滚动条 */
        .file-transfer-section::-webkit-scrollbar {
            width: 6px;
        }
        
        .file-transfer-section::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 3px;
        }
        
        .file-transfer-section::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        .file-transfer-section::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    }    /* 平板优化 - 768px 到 1023px */
    @media (min-width: 768px) and (max-width: 1023px) {
        .file-transfer-section {
            gap: 1.8rem;
            padding: 0.75rem;
            max-height: 50vh;
            overflow-y: auto;
        }
        
        .send-files, .received-files {
            padding: 1.75rem;
        }
        
        .file-list {
            max-height: 280px;
            overflow-y: auto;
        }
    }
</style>
