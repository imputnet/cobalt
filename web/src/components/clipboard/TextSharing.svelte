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
        gap: 2rem;
    }

    .send-text, .received-text {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .text-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        background-color: var(--input-background);
        color: var(--text);
        resize: vertical;
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.5;
        min-height: 100px;
    }

    .text-input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-background);
    }

    .text-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .text-display {
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        background-color: var(--background-alt);
        overflow: hidden;
    }

    .text-content {
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 1rem;
        margin: 0;
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--text);
        max-height: 200px;
        overflow-y: auto;
    }

    .text-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        background-color: var(--background);
        border-top: 1px solid var(--border);
    }

    .copy-btn, .clear-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        background-color: var(--button);
        color: var(--text);
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }

    .copy-btn:hover {
        background-color: var(--accent-background);
        border-color: var(--accent);
        color: var(--accent);
    }

    .clear-btn:hover {
        background-color: var(--red-background);
        border-color: var(--red);
        color: var(--red);
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
