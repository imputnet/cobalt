<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { t } from '$lib/i18n/translations';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    import QRCode from 'qrcode';
    import { currentApiURL } from '$lib/api/api-url';
      // Import clipboard components
    import SessionManager from '$components/clipboard/SessionManager.svelte';
    import TabNavigation from '$components/clipboard/TabNavigation.svelte';
    import FileTransfer from '$components/clipboard/FileTransfer.svelte';
    import TextSharing from '$components/clipboard/TextSharing.svelte';
      // Import clipboard manager
    import { ClipboardManager, clipboardState, type FileItem } from '$lib/clipboard/clipboard-manager';    // Types
    interface ReceivingFile {
        name: string;
        size: number;
        type: string;
        chunks: Uint8Array[];
        receivedSize: number;
    }

    // Constants
    const CHUNK_SIZE = 64 * 1024; // 64KB chunks for file transfer

    // State variables - bound to clipboard manager
    let sessionId = '';
    let joinCode = '';
    let isConnected = false;
    let isCreating = false;
    let isJoining = false;
    let isCreator = false;
    let peerConnected = false;
    let qrCodeUrl = '';
    
    // Navigation state
    let activeTab: 'files' | 'text' = 'files';
    
    // File transfer state
    let files: File[] = [];
    let receivedFiles: FileItem[] = [];
    let textContent = '';
    let receivedText = '';
    let dragover = false;
    let sendingFiles = false;    let receivingFiles = false;
    let transferProgress = 0;
    let currentReceivingFile: ReceivingFile | null = null;
    let dataChannel: RTCDataChannel | null = null;
    let peerConnection: RTCPeerConnection | null = null;
    
    // Clipboard manager instance
    let clipboardManager: ClipboardManager;    // Subscribe to clipboard state
    $: if (clipboardManager) {
        clipboardState.subscribe(state => {
            sessionId = state.sessionId;
            isConnected = state.isConnected;
            isCreating = state.isCreating;
            isJoining = state.isJoining;
            isCreator = state.isCreator;
            peerConnected = state.peerConnected;
            qrCodeUrl = state.qrCodeUrl;
            activeTab = state.activeTab;
            files = state.files;
            receivedFiles = state.receivedFiles;
            // Don't overwrite textContent - it's managed by the TextSharing component binding
            // textContent = state.textContent;
            receivedText = state.receivedText;
            dragover = state.dragover;
            sendingFiles = state.sendingFiles;
            receivingFiles = state.receivingFiles;
            transferProgress = state.transferProgress;
            dataChannel = state.dataChannel;
            peerConnection = state.peerConnection;
        });
    }

    // Event handlers for components
    function handleCreateSession() {
        clipboardManager?.createSession();
    }

    function handleJoinSession() {
        if (joinCode.trim()) {
            clipboardManager?.joinSession(joinCode.trim());
        }
    }

    function handleShareSession() {
        clipboardManager?.shareSession(sessionId);
    }

    function handleCleanup() {
        clipboardManager?.cleanup();
    }

    function handleTabChange(event: CustomEvent<'files' | 'text'>) {
        clipboardState.update(state => ({ ...state, activeTab: event.detail }));
    }

    // File transfer handlers
    function handleFilesSelected(event: CustomEvent) {
        clipboardState.update(state => ({
            ...state,
            files: [...state.files, ...event.detail.files]
        }));
    }

    function handleRemoveFile(event: CustomEvent) {
        clipboardState.update(state => ({
            ...state,
            files: state.files.filter((_, i) => i !== event.detail.index)
        }));
    }    function handleSendFiles() {
        clipboardManager?.sendFiles();
    }

    function handleDownloadFile(event: CustomEvent) {
        const file = event.detail.file;
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleRemoveReceivedFile(event: CustomEvent) {
        clipboardState.update(state => ({
            ...state,
            receivedFiles: state.receivedFiles.filter((_, i) => i !== event.detail.index)
        }));
    }    // Text sharing handlers
    function handleSendText(event?: CustomEvent) {
        const text = event?.detail?.text || textContent;
        console.log('handleSendText called with text:', text);
        console.log('clipboardManager exists:', !!clipboardManager);
        console.log('dataChannel ready:', clipboardManager?.debugInfo?.dataChannel?.readyState);
        console.log('peerConnected:', peerConnected);
        
        if (text.trim()) {
            clipboardManager?.sendText(text);
        } else {
            console.log('No text to send');
        }
    }    function handleClearText() {
        clipboardState.update(state => ({ ...state, receivedText: '' }));
    }// Lifecycle functions
    onMount(async () => {
        clipboardManager = new ClipboardManager();
        
        // Check for session parameter in URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionParam = urlParams.get('session');
            if (sessionParam) {
                joinCode = sessionParam;
                await clipboardManager.joinSession(joinCode);
            }
        }
    });    onDestroy(() => {
        clipboardManager?.cleanup();
    });
</script>

<svelte:head>
    <title>cobalt | {$t("clipboard.title")}</title>
    <meta property="og:title" content="cobalt | {$t("clipboard.title")}" />
    <meta property="og:description" content={$t("clipboard.description")} />
    <meta property="description" content={$t("clipboard.description")} />
</svelte:head>

<div class="clipboard-container">    <div class="clipboard-header">
        <h1>{$t("clipboard.title")}</h1>
        <div class="description-container">
            <p class="description-main">{$t("clipboard.description")}</p>
            <p class="description-subtitle">{$t("clipboard.description_subtitle")}</p>
        </div>
    </div><!-- Session Management Component -->
    <SessionManager
        {sessionId}
        {isConnected}
        {isCreating}
        {isJoining}
        {isCreator}
        {peerConnected}
        {qrCodeUrl}
        on:createSession={handleCreateSession}
        on:joinSession={handleJoinSession}
        on:shareSession={handleShareSession}
        on:cleanup={handleCleanup}
        bind:joinCode
    />    {#if isConnected && peerConnected}        <!-- Connection Status Indicator -->
        <div class="session-status">
            <div class="status-badge">
                <div class="status-dot connected"></div>
                <span class="status-text">已连接到会话</span>
            </div>
        </div>

        <!-- Tab Navigation Component -->
        <TabNavigation
            {activeTab}
            on:tabChange={handleTabChange}
        />

        <!-- Content Area -->
        <div class="tab-content">
            <!-- File Transfer Component -->
            {#if activeTab === 'files'}
                <FileTransfer
                    {files}
                    {receivedFiles}
                    {sendingFiles}
                    {receivingFiles}
                    {transferProgress}
                    {dragover}
                    {peerConnected}
                    on:filesSelected={handleFilesSelected}
                    on:removeFile={handleRemoveFile}
                    on:sendFiles={handleSendFiles}
                    on:downloadFile={handleDownloadFile}
                    on:removeReceivedFile={handleRemoveReceivedFile}
                />
            {/if}

            <!-- Text Sharing Component -->
            {#if activeTab === 'text'}
                <TextSharing
                    {receivedText}
                    {peerConnected}
                    on:sendText={handleSendText}
                    on:clearText={handleClearText}
                    bind:textContent
                />            {/if}
        </div>
    {/if}
</div>

<style>    /* Main container styles */
    .clipboard-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-height: 55vh;
        max-height: 80vh;
        overflow-y: auto;
    }    .clipboard-header {
        text-align: center;
        margin-bottom: 0.5rem;
        padding: 0.25rem 0;
        position: relative;
    }

    .clipboard-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, var(--accent), var(--accent-hover));
        border-radius: 2px;
        margin-bottom: 1rem;
    }    .clipboard-header h1 {
        margin-bottom: 0.2rem;
        font-size: 2.2rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: 0.3rem;
    }.clipboard-header p {
        color: var(--subtext);
        font-size: 1.1rem;
        font-weight: 400;
        opacity: 0.8;
    }    .description-container {
        display: flex;
        flex-direction: column;
        gap: 0.02rem;
        align-items: center;
    }

    .description-main {
        color: var(--text);
        font-size: 1.3rem !important;
        font-weight: 500 !important;
        opacity: 0.9 !important;
        margin: 0;
    }

    .description-subtitle {
        color: var(--subtext);
        font-size: 0.95rem !important;
        font-weight: 400 !important;
        opacity: 0.7 !important;
        margin: 0;
        max-width: 600px;
        line-height: 1.4;
    }    /* Enhanced session status */
    .session-status {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0.25rem 0;
        padding: 0.4rem;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(8px);
    }

    .status-badge {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        animation: pulse 2s infinite;
    }

    .status-text {
        font-weight: 500;
        color: #22c55e;
        font-size: 0.95rem;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.7;
            transform: scale(1.1);
        }
    }    /* Tab content styling */
    .tab-content {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 15px;
        padding: 0.75rem;
        margin-top: 0.25rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
    }

    .tab-content:hover {
        box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
        border-color: rgba(255, 255, 255, 0.12);    }

    /* Enhanced card-like sections */
    :global(.card) {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
    }

    :global(.card:hover) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
    }

    /* Progress indicators */
    :global(.progress-container) {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* File drop zone enhancements */
    :global(.drop-zone) {
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 3rem 2rem;
        text-align: center;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.02);
        position: relative;
        overflow: hidden;
    }

    :global(.drop-zone::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        transition: left 0.6s ease;
    }

    :global(.drop-zone:hover::before) {
        left: 100%;
    }

    :global(.drop-zone.dragover) {
        border-color: var(--accent);
        background: rgba(var(--accent-rgb), 0.05);
        transform: scale(1.02);
    }

    /* Button enhancements */
    :global(.btn-primary) {
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        border: none;
        border-radius: 12px;
        padding: 0.8rem 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.3);
        position: relative;
        overflow: hidden;
    }

    :global(.btn-primary:hover) {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(var(--accent-rgb), 0.4);
    }

    :global(.btn-primary::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
    }

    :global(.btn-primary:hover::before) {
        left: 100%;
    }

    /* Text areas and inputs */
    :global(.text-input, .textarea) {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }

    :global(.text-input:focus, .textarea:focus) {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
        background: rgba(255, 255, 255, 0.08);
    }

    /* Enhanced spacing and layout */
    :global(.section-spacing) {
        margin: 2rem 0;
    }

    :global(.content-spacing) {
        margin: 1.5rem 0;
    }

    /* Loading states */
    :global(.loading-shimmer) {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }    }    /* Override SettingsCategory default padding for clipboard page */
    :global(.settings-content) {
        padding: 0.25rem !important;
        gap: 0.5rem !important;
    }
    
    @media screen and (max-width: 750px) {
        :global(.settings-content) {
            padding: 0.1rem !important;
            gap: 0.25rem !important;
        }
    }    /* Responsive Design */
    @media (max-width: 768px) {
        .clipboard-container {
            padding: 0.75rem;
            margin: 0.75rem;
            border-radius: 16px;
            max-height: 85vh;
        }

        .clipboard-header h1 {
            font-size: 1.9rem;
        }        .clipboard-header {
            padding: 0.5rem 0;
            margin-bottom: 0.75rem;
        }

        :global(.card) {
            padding: 0.75rem;
        }

        :global(.tab-content) {
            padding: 0.75rem;
            margin-top: 0.5rem;
        }
    }    @media (max-width: 480px) {
        .clipboard-container {
            margin: 0.5rem;
            padding: 0.5rem;
            max-height: 90vh;
        }

        .clipboard-header h1 {
            font-size: 1.6rem;
        }

        :global(.drop-zone) {
            padding: 1.5rem 1rem;
        }
    }
</style>
