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
    import DebugPanel from '$components/clipboard/DebugPanel.svelte';
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
    }

    function handleClearText() {
        clipboardState.update(state => ({ ...state, receivedText: '' }));
    }

    // Debug handlers
    function handleRestartWebRTC() {
        // Implementation would be in clipboard manager
        console.log('Restart WebRTC');
    }

    function handleForceConnection() {
        // Implementation would be in clipboard manager
        console.log('Force connection');
    }    // Lifecycle functions
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

<div class="clipboard-container">
    <div class="clipboard-header">
        <h1>{$t("clipboard.title")}</h1>
        <p>{$t("clipboard.description")}</p>
    </div>    <!-- Session Management Component -->
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
    />

    {#if isConnected && peerConnected}
        <!-- Tab Navigation Component -->
        <TabNavigation
            {activeTab}
            on:tabChange={handleTabChange}
        />

        <!-- File Transfer Component -->        {#if activeTab === 'files'}
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

        <!-- Text Sharing Component -->        {#if activeTab === 'text'}
            <TextSharing
                {receivedText}
                {peerConnected}
                on:sendText={handleSendText}
                on:clearText={handleClearText}
                bind:textContent
            />
        {/if}
    {/if}    <!-- Debug Panel Component -->    {#if isConnected}
        <DebugPanel
            {isConnected}
            {sessionId}
            {isCreator}
            {peerConnected}
            {dataChannel}
            {peerConnection}
            on:restartWebRTC={handleRestartWebRTC}
            on:forceConnection={handleForceConnection}
        />

        <!-- Disconnect Section -->
        <div class="disconnect-section">
            <ActionButton id="cleanup" click={handleCleanup}>
                {$t("clipboard.disconnect")}
            </ActionButton>
        </div>
    {/if}
</div>

<style>
    /* Main container styles */
    .clipboard-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .clipboard-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .clipboard-header h1 {
        margin-bottom: 0.5rem;
    }

    .disconnect-section {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .clipboard-container {
            padding: 1rem;
        }
    }
</style>
