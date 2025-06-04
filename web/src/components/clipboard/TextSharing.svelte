<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    
    const dispatch = createEventDispatcher();
    
    export let textContent: string;
    export let receivedText: string;
    export let peerConnected: boolean;
    
    function sendText(): void {
        if (textContent.trim()) {
            dispatch('sendText', { text: textContent });
        }
    }
    
    function clearReceivedText(): void {
        dispatch('clearText');
    }
    
    function copyReceivedText(): void {
        if (receivedText && navigator.clipboard) {
            navigator.clipboard.writeText(receivedText);
        }
    }
</script>

<SettingsCategory title="文本分享" sectionId="text-sharing">
    <div class="text-sharing-section">
        <div class="send-text">
            <h4>发送文本</h4>
            <textarea
                class="text-input"
                bind:value={textContent}
                placeholder="输入要发送的文本..."
                rows="4"
                disabled={!peerConnected}
            ></textarea>            <ActionButton
                id="send-text"
                disabled={!peerConnected || !textContent.trim()}
                click={sendText}
            >
                发送文本
            </ActionButton>
        </div>

        <div class="received-text">
            <h4>已接收文本</h4>
            {#if receivedText}
                <div class="text-display">
                    <div class="text-content">{receivedText}</div>
                    <div class="text-actions">
                        <button
                            class="copy-btn"
                            on:click={copyReceivedText}
                        >
                            📋 复制
                        </button>
                        <button
                            class="clear-btn"
                            on:click={clearReceivedText}
                        >
                            🗑️ 清除
                        </button>
                    </div>
                </div>
            {:else}
                <div class="empty-state">
                    暂无接收到的文本
                </div>
            {/if}
        </div>
    </div>
</SettingsCategory>

<style>
    .text-sharing-section {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        padding: 1rem;
    }

    .send-text, .received-text {
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

    .send-text:hover, .received-text:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .send-text h4, .received-text h4 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .text-input {
        width: 100%;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.02);
        color: var(--text);
        resize: vertical;
        font-family: inherit;
        font-size: 0.95rem;
        line-height: 1.6;
        min-height: 120px;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
    }    .text-input:focus {
        outline: none;
        border-color: rgba(102, 126, 234, 0.5);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
    }

    .text-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .text-display {
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.02);
        overflow: hidden;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
    }

    .text-display:hover {
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .text-content {
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 1.5rem;
        margin: 0;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--text);
        max-height: 250px;
        overflow-y: auto;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
    }

    .text-content::-webkit-scrollbar {
        width: 6px;
    }

    .text-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }

    .text-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .text-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .text-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .copy-btn, .clear-btn {
        padding: 0.75rem 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        color: var(--text);
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .copy-btn:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border-color: rgba(102, 126, 234, 0.3);
        color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .clear-btn:hover {
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%);
        border-color: rgba(244, 67, 54, 0.3);
        color: #f44336;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
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
    }

    @media (max-width: 768px) {
        .text-sharing-section {
            gap: 1.5rem;
        }

        .text-actions {
            flex-direction: column;
        }

        .copy-btn, .clear-btn {
            width: 100%;
        }
    }
</style>
