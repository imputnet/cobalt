<script lang="ts">    import { onMount, onDestroy } from 'svelte';
    import { t } from '$lib/i18n/translations';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    import QRCode from 'qrcode';
    import { currentApiURL } from '$lib/api/api-url';

    // Types
    interface FileItem {
        name: string;
        size: number;
        type: string;
        blob: Blob;
    }

    interface ReceivingFile {
        name: string;
        size: number;
        type: string;
        chunks: Uint8Array[];
        receivedSize: number;
    }

    // State variables
    let sessionId = '';
    let joinCode = '';
    let isConnected = false;
    let isCreating = false;
    let isJoining = false;
    let isCreator = false;
    let peerConnected = false;
    let qrCodeUrl = '';
    
    // WebSocket and WebRTC
    let ws: WebSocket | null = null;
    let peerConnection: RTCPeerConnection | null = null;
    let dataChannel: RTCDataChannel | null = null;
    
    // Encryption
    let keyPair: CryptoKeyPair | null = null;
    let remotePublicKey: CryptoKey | null = null;
    let sharedKey: CryptoKey | null = null;
    
    // File transfer
    let files: File[] = [];
    let receivedFiles: FileItem[] = [];
    let textContent = '';
    let dragover = false;
    let sendingFiles = false;
    let receivingFiles = false;
    let transferProgress = 0;
    let currentReceivingFile: ReceivingFile | null = null;

    // Constants
    const CHUNK_SIZE = 64 * 1024; // 64KB chunks

    onMount(async () => {
        // Check for session parameter in URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionParam = urlParams.get('session');
            if (sessionParam) {
                joinCode = sessionParam;
                await joinSession();
            }
        }
    });

    onDestroy(() => {
        cleanup();
    });    function getWebSocketURL(): string {
        if (typeof window === 'undefined') return 'ws://localhost:9000/ws';
        
        const apiUrl = currentApiURL();
        console.log('Current API URL:', apiUrl);
        
        // For local development with SSL, use the Vite proxy
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let host = window.location.host;
            
            // For mobile access, use the actual IP instead of localhost
            if (host.includes('localhost') || host.includes('127.0.0.1')) {
                host = '192.168.1.12:5173';
            }
            
            const wsUrl = `${protocol}//${host}/ws`;
            console.log('Constructed WebSocket URL:', wsUrl);
            return wsUrl;
        }
        
        // Fallback for server-side rendering
        return 'ws://192.168.1.12:9000/ws';
    }

    async function generateKeyPair(): Promise<void> {
        keyPair = await window.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            false,
            ['deriveKey']
        );
    }

    async function exportPublicKey(): Promise<ArrayBuffer> {
        if (!keyPair) throw new Error('Key pair not generated');
        return await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
    }    async function importRemotePublicKey(publicKeyArray: number[]): Promise<void> {
        const publicKeyBuffer = new Uint8Array(publicKeyArray).buffer;
        remotePublicKey = await window.crypto.subtle.importKey(
            'raw',
            publicKeyBuffer,
            { name: 'ECDH', namedCurve: 'P-256' },
            false,
            []
        );
    }

    async function deriveSharedKey(): Promise<void> {
        if (!keyPair || !remotePublicKey) throw new Error('Keys not available');
        
        sharedKey = await window.crypto.subtle.deriveKey(
            { name: 'ECDH', public: remotePublicKey },
            keyPair.privateKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function encryptData(data: string): Promise<ArrayBuffer> {
        if (!sharedKey) throw new Error('Shared key not available');
        
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            sharedKey,
            dataBuffer
        );
        
        // Combine IV and encrypted data
        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encrypted), iv.length);
        
        return result.buffer;
    }

    async function decryptData(encryptedBuffer: ArrayBuffer): Promise<string> {
        if (!sharedKey) throw new Error('Shared key not available');
        
        const encryptedArray = new Uint8Array(encryptedBuffer);
        const iv = encryptedArray.slice(0, 12);
        const encrypted = encryptedArray.slice(12);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            sharedKey,
            encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    async function connectWebSocket(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = getWebSocketURL();
                console.log('Connecting to WebSocket:', wsUrl);
                ws = new WebSocket(wsUrl);
                
                ws.onopen = () => {
                    console.log('WebSocket connected');
                    isConnected = true;
                    resolve();
                };
                
                ws.onmessage = async (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('WebSocket message:', message);
                        await handleWebSocketMessage(message);
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                    }
                };
                
                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    isConnected = false;
                };
                  ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    console.error('WebSocket error details:', { 
                        readyState: ws?.readyState,
                        url: wsUrl,
                        error: error 
                    });
                    isConnected = false;
                    alert('WebSocket connection failed. Check console for details.');
                    reject(new Error('WebSocket connection failed'));
                };
            } catch (error) {
                reject(error);
            }
        });
    }    async function handleWebSocketMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'session_created':
                sessionId = message.sessionId;
                isCreating = false;
                isCreator = true;
                console.log('Session created:', sessionId);
                await generateQRCode();
                break;
                
            case 'session_joined':
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                isJoining = false;
                await setupWebRTC(false);
                break;
                
            case 'peer_joined':
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                if (isCreator) {
                    await setupWebRTC(true);
                }
                break;
                
            case 'offer':
                await handleOffer(message.offer);
                break;
                
            case 'answer':
                await handleAnswer(message.answer);
                break;
                
            case 'ice_candidate':
                await handleIceCandidate(message.candidate);
                break;
                  case 'error':
                console.error('Server error:', message);
                alert(`WebSocket error: ${message.message || message.error || 'Unknown error'}`);
                isCreating = false;
                isJoining = false;
                break;
                
            default:
                console.warn('Unknown message type:', message);
                break;
        }
    }    async function createSession(): Promise<void> {
        try {
            isCreating = true;
            await generateKeyPair();
            await connectWebSocket();
            
            const publicKeyBuffer = await exportPublicKey();
            const publicKeyArray = Array.from(new Uint8Array(publicKeyBuffer));
            
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'create_session',
                    publicKey: publicKeyArray
                }));
            }
        } catch (error) {
            console.error('Error creating session:', error);
            isCreating = false;
        }    }    async function joinSession(): Promise<void> {
        try {
            console.log('Starting join session process...', { joinCode, hasWebSocket: !!ws });
            isJoining = true;
            
            console.log('Generating key pair...');
            await generateKeyPair();
            console.log('Key pair generated successfully');
            
            console.log('Connecting to WebSocket...');
            await connectWebSocket();
            console.log('WebSocket connected, sending join request...');
            
            const publicKeyBuffer = await exportPublicKey();
            const publicKeyArray = Array.from(new Uint8Array(publicKeyBuffer));
            console.log('Public key prepared, array length:', publicKeyArray.length);
            
            if (ws && ws.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'join_session',
                    sessionId: joinCode,
                    publicKey: publicKeyArray
                };
                console.log('Sending join message:', message);
                ws.send(JSON.stringify(message));
                console.log('Join message sent successfully');
            } else {
                console.error('WebSocket not ready:', { ws: !!ws, readyState: ws?.readyState });
                alert('WebSocket connection failed. Please try again.');
                isJoining = false;
            }        } catch (error) {
            console.error('Error joining session:', error);
            alert(`Failed to join session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            isJoining = false;
        }
    }

    async function setupWebRTC(shouldCreateOffer: boolean): Promise<void> {
        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate && ws) {
                ws.send(JSON.stringify({
                    type: 'ice_candidate',
                    candidate: event.candidate
                }));
            }
        };

        if (shouldCreateOffer) {
            dataChannel = peerConnection.createDataChannel('fileTransfer', { ordered: true });
            setupDataChannel(dataChannel);
            
            peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
                if (peerConnection) {
                    peerConnection.setLocalDescription(offer);
                    if (ws) {
                        ws.send(JSON.stringify({ type: 'offer', offer: offer }));
                    }
                }
            });
        } else {
            peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
                dataChannel = event.channel;
                setupDataChannel(dataChannel);
            };
        }
    }

    function setupDataChannel(channel: RTCDataChannel): void {
        channel.onopen = () => {
            console.log('Data channel opened');
            peerConnected = true;
        };

        channel.onclose = () => {
            console.log('Data channel closed');
            peerConnected = false;
        };

        channel.onmessage = async (event) => {
            try {
                const encryptedData = event.data;
                const decryptedMessage = await decryptData(encryptedData);
                const message = JSON.parse(decryptedMessage);
                
                if (message.type === 'text') {
                    textContent = message.data;
                } else if (message.type === 'file_info') {
                    currentReceivingFile = {
                        name: message.name,
                        size: message.size,
                        type: message.type,
                        chunks: [],
                        receivedSize: 0
                    };
                    receivingFiles = true;
                } else if (message.type === 'file_chunk' && currentReceivingFile) {
                    const chunkData = new Uint8Array(message.data);
                    currentReceivingFile.chunks.push(chunkData);
                    currentReceivingFile.receivedSize += chunkData.length;
                    transferProgress = (currentReceivingFile.receivedSize / currentReceivingFile.size) * 100;
                    
                    if (currentReceivingFile.receivedSize >= currentReceivingFile.size) {
                        const completeFile = new Blob(currentReceivingFile.chunks, { type: currentReceivingFile.type });
                        receivedFiles = [...receivedFiles, {
                            name: currentReceivingFile.name,
                            size: currentReceivingFile.size,
                            type: currentReceivingFile.type,
                            blob: completeFile
                        }];
                        
                        currentReceivingFile = null;
                        receivingFiles = false;
                        transferProgress = 0;
                    }
                }
            } catch (error) {
                console.error('Error handling data channel message:', error);
            }
        };
    }

    async function handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        if (!peerConnection) return;
        
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        if (ws) {
            ws.send(JSON.stringify({ type: 'answer', answer: answer }));
        }
    }

    async function handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!peerConnection) return;
        await peerConnection.setRemoteDescription(answer);
    }

    async function handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!peerConnection) return;
        await peerConnection.addIceCandidate(candidate);
    }

    async function sendText(): Promise<void> {
        if (!dataChannel || !peerConnected || !textContent.trim()) return;
        
        try {
            const message = { type: 'text', data: textContent.trim() };
            const encryptedData = await encryptData(JSON.stringify(message));
            
            if (dataChannel) {
                dataChannel.send(encryptedData);
                textContent = '';
            }
        } catch (error) {
            console.error('Error sending text:', error);
        }
    }

    async function sendFiles(): Promise<void> {
        if (!dataChannel || !peerConnected || files.length === 0) return;
        
        sendingFiles = true;
        transferProgress = 0;
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Send file info
                const fileInfo = { type: 'file_info', name: file.name, size: file.size, mimeType: file.type };
                const encryptedInfo = await encryptData(JSON.stringify(fileInfo));
                dataChannel.send(encryptedInfo);
                
                // Send file chunks
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                    const start = chunkIndex * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);
                    const chunkArray = new Uint8Array(await chunk.arrayBuffer());
                    
                    const chunkMessage = { type: 'file_chunk', data: Array.from(chunkArray) };
                    const encryptedChunk = await encryptData(JSON.stringify(chunkMessage));
                    dataChannel.send(encryptedChunk);
                    
                    const fileProgress = (chunkIndex + 1) / totalChunks;
                    const totalProgress = ((i + fileProgress) / files.length) * 100;
                    transferProgress = totalProgress;
                    
                    // Small delay to prevent overwhelming the connection
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            files = [];
            transferProgress = 0;
            sendingFiles = false;
        } catch (error) {
            console.error('Error sending files:', error);
            sendingFiles = false;
        }
    }

    function handleFileSelect(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            files = [...files, ...Array.from(target.files)];
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
            files = [...files, ...Array.from(event.dataTransfer.files)];
        }
    }

    function removeFile(index: number): void {
        files = files.filter((_, i) => i !== index);
    }

    function downloadReceivedFile(file: FileItem): void {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function removeReceivedFile(index: number): void {
        const file = receivedFiles[index];
        URL.revokeObjectURL(URL.createObjectURL(file.blob));
        receivedFiles = receivedFiles.filter((_, i) => i !== index);
    }

    function formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }    async function generateQRCode(): Promise<void> {
        try {
            if (typeof window !== 'undefined' && sessionId) {
                // For QR codes, use the actual IP address instead of localhost
                let origin = window.location.origin;
                if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                    // Use the same IP that we use for WebSocket connections
                    origin = origin.replace(/localhost:\d+|127\.0\.0\.1:\d+/, '192.168.1.12:5173');
                }
                
                const url = `${origin}/clipboard?session=${sessionId}`;
                qrCodeUrl = await QRCode.toDataURL(url, {
                    width: 200,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' }
                });
                console.log('QR Code generated:', { sessionId, url, qrCodeUrl: 'data URL created' });
            }
        } catch (error) {
            console.error('QR Code generation failed:', error);
            console.log('QR Code generation failed:', { hasWindow: typeof window !== 'undefined', sessionId });
        }
    }    function shareSession(): void {
        if (typeof window !== 'undefined' && sessionId) {
            // Use the same logic as QR code generation for consistency
            let origin = window.location.origin;
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                origin = origin.replace(/localhost:\d+|127\.0\.0\.1:\d+/, '192.168.1.12:5173');
            }
            
            const url = `${origin}/clipboard?session=${sessionId}`;
            navigator.clipboard.writeText(url);
        }
    }

    function cleanup(): void {
        if (dataChannel) {
            dataChannel.close();
            dataChannel = null;
        }
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
        
        sessionId = '';
        isConnected = false;
        peerConnected = false;
        sharedKey = null;
        remotePublicKey = null;
        qrCodeUrl = '';
    }
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
    </div>

    {#if !isConnected}
        <SettingsCategory title={$t("clipboard.title")} sectionId="connection-setup">
            <div class="connection-setup">
                <div class="setup-option">
                    <h3>{$t("clipboard.create_session")}</h3>
                    <p>{$t("clipboard.create_description")}</p>                    <ActionButton
                        id="create-session"
                        click={createSession}                        disabled={isCreating}
                    >
                        {isCreating ? $t("clipboard.creating") : $t("clipboard.create")}
                    </ActionButton>
                </div>
                
                <div class="divider">
                    <span>{$t("general.or")}</span>
                </div>
                
                <div class="setup-option">
                    <h3>{$t("clipboard.join_session")}</h3>
                    <p>{$t("clipboard.join_description")}</p>
                    <div class="join-form">
                        <input
                            type="text"
                            bind:value={joinCode}
                            placeholder={$t("clipboard.enter_code")}
                            disabled={isJoining}
                        />                        <ActionButton
                            id="join-session"
                            click={joinSession}
                            disabled={isJoining || !joinCode.trim()}
                        >
                            {isJoining ? $t("clipboard.joining") : $t("clipboard.join")}
                        </ActionButton>
                    </div>
                </div>
            </div>
        </SettingsCategory>
    {:else}
        <SettingsCategory title={$t("clipboard.session_active")} sectionId="session-info">
            <div class="session-info">
                <h3>{$t("clipboard.session_active")}</h3>
                <div class="session-details">
                    <div class="session-id">
                        <strong>{$t("clipboard.session_id")}:</strong>
                        <code>{sessionId}</code>
                    </div>
                    
                    {#if isCreator && sessionId && !peerConnected && qrCodeUrl}
                        <div class="qr-code">
                            <p>{$t("clipboard.scan_qr")}</p>
                            <img src={qrCodeUrl} alt="QR Code" />
                        </div>
                    {/if}
                    
                    <div class="connection-status">
                        <span class="status-indicator" class:connected={peerConnected}></span>
                        {peerConnected ? $t("clipboard.peer_connected") : $t("clipboard.waiting_peer")}
                    </div>
                </div>
            </div>
        </SettingsCategory>

        {#if peerConnected}
            <SettingsCategory title={$t("clipboard.send_text")} sectionId="text-transfer">
                <div class="text-transfer">
                    <h3>{$t("clipboard.send_text")}</h3>
                    <textarea
                        bind:value={textContent}
                        placeholder={$t("clipboard.enter_text")}
                        rows="4"
                    ></textarea>                    <ActionButton id="send-text" click={sendText} disabled={!textContent.trim()}>
                        {$t("clipboard.send")}
                    </ActionButton>
                </div>
            </SettingsCategory>

            <SettingsCategory title={$t("clipboard.send_files")} sectionId="file-transfer">
                <div class="file-transfer">
                    <h3>{$t("clipboard.send_files")}</h3>
                    <div
                        class="drop-zone"
                        on:dragover|preventDefault={handleDragOver}
                        on:dragleave={handleDragLeave}
                        on:drop={handleDrop}
                        class:dragover
                    >
                        <div class="drop-content">
                            <p>{$t("clipboard.drop_files")}</p>
                            <input
                                type="file"
                                multiple
                                on:change={handleFileSelect}
                                id="file-input"
                                style="display: none;"
                            />                            <ActionButton id="select-files" click={() => document.getElementById('file-input')?.click()}>
                                {$t("clipboard.select_files")}
                            </ActionButton>
                        </div>
                    </div>
                    
                    {#if files.length > 0}
                        <div class="file-list">
                            {#each files as file, index}
                                <div class="file-item">
                                    <span class="file-name">{file.name}</span>
                                    <span class="file-size">({formatFileSize(file.size)})</span>
                                    <button class="remove-btn" on:click={() => removeFile(index)}>×</button>
                                </div>
                            {/each}                            <ActionButton id="send-files" click={sendFiles} disabled={sendingFiles}>
                                {sendingFiles ? $t("clipboard.sending") : $t("clipboard.send")}
                            </ActionButton>
                            
                            {#if sendingFiles || transferProgress > 0}
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: {transferProgress}%"></div>
                                </div>
                                <span class="progress-text">{Math.round(transferProgress)}%</span>
                            {/if}
                        </div>
                    {/if}
                </div>
            </SettingsCategory>

            {#if receivedFiles.length > 0}
                <SettingsCategory title={$t("clipboard.received_files")} sectionId="received-files">
                    <div class="received-files">
                        <h3>{$t("clipboard.received_files")}</h3>
                        <div class="file-list">
                            {#each receivedFiles as file, index}
                                <div class="file-item">
                                    <span class="file-name">{file.name}</span>
                                    <span class="file-size">({formatFileSize(file.size)})</span>
                                    <div class="file-actions">
                                        <button class="download-btn" on:click={() => downloadReceivedFile(file)}>
                                            ⬇ {$t("clipboard.download")}
                                        </button>
                                        <button class="remove-btn" on:click={() => removeReceivedFile(index)}>×</button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </SettingsCategory>
            {/if}

            {#if receivingFiles && currentReceivingFile}
                <SettingsCategory title={$t("clipboard.receiving")} sectionId="receiving-progress">
                    <div class="receiving-progress">
                        <h3>{$t("clipboard.receiving")}: {currentReceivingFile.name}</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: {transferProgress}%"></div>
                        </div>
                        <span class="progress-text">{Math.round(transferProgress)}% ({formatFileSize(currentReceivingFile.receivedSize)} / {formatFileSize(currentReceivingFile.size)})</span>
                    </div>
                </SettingsCategory>
            {/if}
        {/if}        <div class="disconnect-section">
            <ActionButton id="cleanup" click={cleanup}>
                {$t("clipboard.disconnect")}
            </ActionButton>
        </div>
    {/if}
</div>

<style>
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

    .connection-setup {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .setup-option {
        text-align: center;
    }

    .setup-option h3 {
        margin-bottom: 0.5rem;
    }

    .divider {
        text-align: center;
        position: relative;
        margin: 1rem 0;
    }

    .divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: var(--border);
    }

    .divider span {
        background-color: var(--background);
        padding: 0 1rem;
        color: var(--secondary);
    }

    .join-form {
        display: flex;
        gap: 1rem;
        max-width: 400px;
        margin: 0 auto;
    }

    .join-form input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        background-color: var(--input-background);
        color: var(--text);
    }

    .session-info {
        text-align: center;
    }

    .session-details {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }

    .session-id {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .session-id code {
        background-color: var(--border);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-family: monospace;
    }

    .qr-code {
        text-align: center;
    }

    .qr-code img {
        max-width: 200px;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
    }

    .connection-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--red);
    }

    .status-indicator.connected {
        background-color: var(--green);
    }

    .text-transfer textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        background-color: var(--input-background);
        color: var(--text);
        resize: vertical;
        margin-bottom: 1rem;
    }

    .drop-zone {
        border: 2px dashed var(--border);
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        transition: border-color 0.2s;
        margin-bottom: 1rem;
    }

    .drop-zone.dragover {
        border-color: var(--accent);
        background-color: var(--accent-background);
    }

    .file-list {
        margin-top: 1rem;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
    }

    .file-name {
        flex: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .file-size {
        color: var(--secondary);
        font-size: 0.9rem;
    }

    .file-actions {
        display: flex;
        gap: 0.5rem;
    }

    .download-btn, .remove-btn {
        background: none;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        color: var(--text);
        transition: background-color 0.2s;
    }

    .download-btn:hover {
        background-color: var(--accent-background);
    }

    .remove-btn:hover {
        background-color: var(--red-background);
        color: var(--red);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: var(--border);
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem 0;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--accent);
        transition: width 0.3s ease;
    }

    .progress-text {
        font-size: 0.9rem;
        color: var(--secondary);
    }

    .disconnect-section {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border);
    }

    @media (min-width: 768px) {
        .connection-setup {
            flex-direction: row;
            align-items: flex-start;
        }

        .setup-option {
            flex: 1;
        }

        .divider {
            align-self: center;
            margin: 0 2rem;
            width: 60px;
        }

        .divider::before {
            top: 0;
            bottom: 0;
            left: 50%;
            right: auto;
            width: 1px;
            height: auto;
        }

        .session-details {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
        }

        .qr-code {
            order: -1;
        }
    }
</style>
