<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    
    const dispatch = createEventDispatcher();
    
    export let textContent: string;
    export let receivedText: string;
    export let peerConnected: boolean;
    
    let previousReceivedText = '';
    let showNewMessageNotification = false;
    let isNewMessage = false;
    let receivedTextElement: HTMLElement;
    
    // 监听接收文本的变化
    $: if (receivedText !== previousReceivedText && receivedText && previousReceivedText !== '') {
        handleNewTextReceived();
        previousReceivedText = receivedText;
    }
    
    // 初始化时记录当前文本
    onMount(() => {
        previousReceivedText = receivedText;
    });
    
    function handleNewTextReceived() {
        // 显示新消息通知
        showNewMessageNotification = true;
        isNewMessage = true;
        
        // 滚动到接收文本区域
        if (receivedTextElement) {
            receivedTextElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        
        // 3秒后隐藏通知
        setTimeout(() => {
            showNewMessageNotification = false;
        }, 3000);
        
        // 5秒后移除新消息高亮
        setTimeout(() => {
            isNewMessage = false;
        }, 5000);
        
        // 可选：播放提示音
        playNotificationSound();
    }
      function playNotificationSound() {
        try {
            // 创建一个短暂的提示音
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // 如果音频播放失败，忽略错误
            console.log('Audio notification not available');
        }
    }
    
    function sendText(): void {
        if (textContent.trim()) {
            dispatch('sendText', { text: textContent });
        }
    }
    
    function clearReceivedText(): void {
        isNewMessage = false;
        showNewMessageNotification = false;
        dispatch('clearText');
    }
    
    function copyReceivedText(): void {
        if (receivedText && navigator.clipboard) {
            navigator.clipboard.writeText(receivedText);
            isNewMessage = false;
        }
    }
    
    function dismissNotification() {
        showNewMessageNotification = false;
        isNewMessage = false;
    }
</script>

<!-- 新消息通知 -->
{#if showNewMessageNotification}
    <div class="new-message-notification" on:click={dismissNotification}>
        <div class="notification-content">
            <div class="notification-icon">📩</div>
            <div class="notification-text">
                <strong>收到新消息</strong>
                <span>点击此处查看</span>
            </div>
            <button class="notification-close" on:click|stopPropagation={dismissNotification}>✕</button>
        </div>
    </div>
{/if}

<SettingsCategory title="文本分享" sectionId="text-sharing">
    <div class="text-sharing-section">
        <!-- 接收文本区域 - 移到上方 -->
        <div class="received-text" class:new-message={isNewMessage} bind:this={receivedTextElement}>
            <h4>已接收文本 {#if isNewMessage}<span class="new-badge">新</span>{/if}</h4>
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

        <!-- 发送文本区域 - 移到下方 -->
        <div class="send-text">
            <h4>发送文本</h4>
            <textarea
                class="text-input"
                bind:value={textContent}
                placeholder="输入要发送的文本..."
                rows="4"
                disabled={!peerConnected}
            ></textarea>
            <ActionButton
                id="send-text"
                disabled={!peerConnected || !textContent.trim()}
                click={sendText}
            >
                发送文本
            </ActionButton>
        </div>
    </div>
</SettingsCategory>

<style>
    /* 新消息通知样式 */
    .new-message-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        animation: slideInRight 0.3s ease-out;
        cursor: pointer;
        max-width: 320px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    }

    .notification-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 0.75rem;
        position: relative;
    }

    .notification-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
    }

    .notification-text {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        color: white;
        flex: 1;
    }

    .notification-text strong {
        font-weight: 600;
        font-size: 0.95rem;
    }

    .notification-text span {
        font-size: 0.8rem;
        opacity: 0.9;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
    }

    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* 新消息徽章 */
    .new-badge {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-weight: 600;
        margin-left: 0.5rem;
        animation: pulse 2s infinite;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.8;
        }
    }

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

    /* 新消息状态的特殊样式 */
    .received-text.new-message {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-color: rgba(102, 126, 234, 0.3);
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
        animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
        from {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
        }
        to {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
        }
    }

    .send-text:hover, .received-text:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .received-text.new-message:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 35px rgba(102, 126, 234, 0.3);
        border-color: rgba(102, 126, 234, 0.4);
    }

    .send-text h4, .received-text h4 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: flex;
        align-items: center;
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
    }

    .text-input:focus {
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
        padding: 1.5rem;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: var(--text);
        line-height: 1.7;
        font-size: 0.95rem;
        background: rgba(255, 255, 255, 0.01);
        min-height: 60px;
        max-height: 300px;
        overflow-y: auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .text-content::-webkit-scrollbar {
        width: 6px;
    }

    .text-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 3px;
    }

    .text-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }

    .text-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .text-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.01);
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .copy-btn, .clear-btn {
        padding: 0.75rem 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        color: var(--text);
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 44px;
    }

    .copy-btn:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-color: rgba(102, 126, 234, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
    }

    .clear-btn:hover {
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%);
        border-color: rgba(244, 67, 54, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.2);
    }

    .copy-btn:active, .clear-btn:active {
        transform: translateY(0) scale(0.95);
    }

    .empty-state {
        padding: 3rem 2rem;
        text-align: center;
        color: var(--secondary);
        background: rgba(255, 255, 255, 0.01);
        border-radius: 12px;
        border: 2px dashed rgba(255, 255, 255, 0.1);
        font-style: italic;
        backdrop-filter: blur(4px);
        position: relative;
        overflow: hidden;
    }

    .empty-state::before {
        content: '📭';
        display: block;
        font-size: 2.5rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .empty-state::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
        animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    /* 移动端响应式 */
    @media (max-width: 768px) {
        .new-message-notification {
            right: 10px;
            left: 10px;
            max-width: none;
            top: 10px;
        }

        .text-sharing-section {
            gap: 1.5rem;
            padding: 0.5rem;
        }

        .send-text, .received-text {
            padding: 1.5rem;
            gap: 1rem;
        }

        .text-input {
            min-height: 100px;
            font-size: 0.9rem;
        }

        .text-content {
            padding: 1rem;
            font-size: 0.9rem;
            max-height: 200px;
        }

        .text-actions {
            padding: 0.75rem 1rem;
            gap: 0.5rem;
        }

        .copy-btn, .clear-btn {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
            flex: 1;
            justify-content: center;
        }

        .empty-state {
            padding: 2rem 1rem;
        }

        .empty-state::before {
            font-size: 2rem;
            margin-bottom: 0.75rem;
        }
    }

    @media (max-width: 480px) {
        .notification-content {
            padding: 0.75rem;
            gap: 0.5rem;
        }

        .notification-text strong {
            font-size: 0.9rem;
        }

        .notification-text span {
            font-size: 0.75rem;
        }
    }
</style>
