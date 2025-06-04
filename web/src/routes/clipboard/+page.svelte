<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
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

    // Constants
    const CHUNK_SIZE = 64 * 1024; // 64KB chunks for file transfer

    // State variables
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
    
    // WebSocket and WebRTC
    let ws: WebSocket | null = null;
    let peerConnection: RTCPeerConnection | null = null;
    let dataChannel: RTCDataChannel | null = null;
    
    // Encryption
    let keyPair: CryptoKeyPair | null = null;
    let remotePublicKey: CryptoKey | null = null;
    let sharedKey: CryptoKey | null = null;    // File transfer
    let files: File[] = [];
    let receivedFiles: FileItem[] = [];
    let textContent = '';
    let receivedText = '';
    let dragover = false;
    let sendingFiles = false;
    let receivingFiles = false;
    let transferProgress = 0;
    let currentReceivingFile: ReceivingFile | null = null;
    let fileInput: HTMLInputElement;
    
    // Session persistence
    let storedSessionId = '';
    let storedIsCreator = false;
    
    // Load stored session data
    function loadStoredSession(): void {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('clipboard_session');
            if (stored) {
                try {
                    const sessionData = JSON.parse(stored);
                    const now = Date.now();
                    
                    // Check if session is still valid (30 minute timeout)
                    if (sessionData.timestamp && (now - sessionData.timestamp) < 30 * 60 * 1000) {
                        storedSessionId = sessionData.sessionId || '';
                        storedIsCreator = sessionData.isCreator || false;
                        console.log('📁 Loaded stored session:', { 
                            sessionId: storedSessionId, 
                            isCreator: storedIsCreator,
                            age: Math.round((now - sessionData.timestamp) / 1000) + 's'
                        });
                        return;
                    } else {
                        console.log('🕐 Stored session expired, clearing...');
                        localStorage.removeItem('clipboard_session');
                    }
                } catch (error) {
                    console.error('❌ Error loading stored session:', error);
                    localStorage.removeItem('clipboard_session');
                }
            }
        }
        
        storedSessionId = '';
        storedIsCreator = false;
    }
    
    // Save session data to localStorage
    function saveSession(sessionId: string, isCreator: boolean): void {
        if (typeof window !== 'undefined' && sessionId) {
            const sessionData = {
                sessionId,
                isCreator,
                timestamp: Date.now()
            };
            localStorage.setItem('clipboard_session', JSON.stringify(sessionData));
            console.log('💾 Session saved to localStorage:', sessionData);
        }
    }
    
    // Clear stored session
    function clearStoredSession(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('clipboard_session');
            console.log('🗑️ Stored session cleared');
        }
        storedSessionId = '';
        storedIsCreator = false;
    }
    
    // Attempt to reconnect to stored session
    async function reconnectToStoredSession(): Promise<boolean> {
        if (!storedSessionId) return false;
        
        try {
            console.log('🔄 Attempting to reconnect to stored session:', storedSessionId);
            
            await generateKeyPair();
            await connectWebSocket();
            
            const publicKeyBuffer = await exportPublicKey();
            const publicKeyArray = Array.from(new Uint8Array(publicKeyBuffer));
            
            if (ws) {
                if (storedIsCreator) {
                    // Reconnect as creator
                    ws.send(JSON.stringify({
                        type: 'create_session',
                        existingSessionId: storedSessionId,
                        publicKey: publicKeyArray
                    }));
                } else {
                    // Reconnect as joiner
                    ws.send(JSON.stringify({
                        type: 'join_session',
                        sessionId: storedSessionId,
                        publicKey: publicKeyArray
                    }));
                }
                return true;
            }
        } catch (error) {
            console.error('❌ Error reconnecting to stored session:', error);
            clearStoredSession();
        }
        
        return false;
    }

    // Lifecycle functions
    let statusInterval: ReturnType<typeof setInterval> | null = null;
    
    onMount(async () => {
        // Check for session parameter in URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const sessionParam = urlParams.get('session');
            if (sessionParam) {
                joinCode = sessionParam;
                await joinSession();
            } else {
                // Try to reconnect to stored session if no session param
                loadStoredSession();
                if (storedSessionId) {
                    console.log('🔄 Reconnecting to stored session on mount:', storedSessionId);
                    await reconnectToStoredSession();
                }
            }
        }
        
        // Start periodic connection status check
        statusInterval = setInterval(() => {
            if (dataChannel) {
                const wasConnected = peerConnected;
                const isNowConnected = dataChannel.readyState === 'open';
                
                if (wasConnected !== isNowConnected) {
                    console.log('Data channel state changed:', {
                        was: wasConnected,
                        now: isNowConnected,
                        readyState: dataChannel.readyState
                    });                    peerConnected = isNowConnected;
                }
            }
        }, 1000);
    });

    onDestroy(() => {
        if (statusInterval) {
            clearInterval(statusInterval);
        }
        cleanup();
    });

    // Helper functions
    function getWebSocketURL(): string {
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
        );    }

    async function exportPublicKey(): Promise<ArrayBuffer> {
        if (!keyPair) throw new Error('Key pair not generated');
        return await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
    }

    async function importRemotePublicKey(publicKeyArray: number[]): Promise<void> {
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
        console.log('Handling WebSocket message:', message.type, message);
        
        switch (message.type) {
            case 'session_created':
                sessionId = message.sessionId;
                isCreating = false;
                isCreator = true;
                console.log('Session created:', sessionId);
                await generateQRCode();
                saveSession(sessionId, isCreator); // Save session on create
                break;
                
            case 'session_reconnected':
                sessionId = message.sessionId;
                isCreating = false;
                isCreator = true;
                console.log('Session reconnected:', sessionId);
                await generateQRCode();
                saveSession(sessionId, isCreator); // Update saved session on reconnect
                break;
                
            case 'session_joined':
                console.log('Session joined successfully, setting up WebRTC...');
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                isJoining = false;
                console.log('About to setup WebRTC as joiner (offer=false)');
                await setupWebRTC(false);
                break;
                
            case 'waiting_for_creator':
                console.log('Waiting for creator to reconnect...');
                isJoining = false;
                // 可以显示等待状态给用户
                break;
                
            case 'creator_reconnected':
                console.log('Creator reconnected, setting up WebRTC...');
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                console.log('About to setup WebRTC as joiner (offer=false)');
                await setupWebRTC(false);
                break;
                
            case 'peer_already_joined':
                console.log('Peer already joined, setting up WebRTC...');
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                console.log('Setting up WebRTC as creator (offer=true)');
                await setupWebRTC(true);
                break;
                
            case 'peer_joined':
                console.log('Peer joined, setting up WebRTC...');
                await importRemotePublicKey(message.publicKey);
                await deriveSharedKey();
                if (isCreator) {
                    console.log('Setting up WebRTC as creator (offer=true)');
                    await setupWebRTC(true);
                } else {
                    console.log('Setting up WebRTC as joiner (offer=false)');
                    await setupWebRTC(false);
                }
                break;
                
            case 'peer_disconnected':
                console.log('Peer disconnected, waiting for reconnection...');
                peerConnected = false;
                // 可以显示等待重连状态
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
    }    async function setupWebRTC(shouldCreateOffer: boolean): Promise<void> {
        console.log('Setting up WebRTC...', { shouldCreateOffer, isCreator });
        
        // Clean up any existing connection
        if (peerConnection) {
            console.log('🧹 Cleaning up existing peer connection');
            peerConnection.close();
        }
        
        peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        });

        // Enhanced connection state tracking
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection?.connectionState;
            console.log('🔄 Peer connection state changed:', state);
            
            if (state === 'connected') {
                console.log('🎉 Peer connection established successfully!');
            } else if (state === 'failed') {
                console.error('❌ Peer connection failed');
                peerConnected = false;
                // Try to restart connection after a delay
                setTimeout(() => {
                    if (isCreator && state === 'failed') {
                        console.log('🔄 Attempting to restart failed connection...');
                        setupWebRTC(true);
                    }
                }, 2000);
            } else if (state === 'disconnected') {
                console.warn('⚠️ Peer connection disconnected');
                peerConnected = false;
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            const iceState = peerConnection?.iceConnectionState;
            console.log('🧊 ICE connection state changed:', iceState);
            
            if (iceState === 'connected' || iceState === 'completed') {
                console.log('🎉 ICE connection established!');
            } else if (iceState === 'failed') {
                console.error('❌ ICE connection failed - checking data channel...');
                if (dataChannel && dataChannel.readyState !== 'open') {
                    console.log('🔄 ICE failed but data channel not open, will restart');
                    setTimeout(() => {
                        if (isCreator && iceState === 'failed') {
                            console.log('🔄 Restarting WebRTC due to ICE failure...');
                            setupWebRTC(true);
                        }
                    }, 3000);
                }
            } else if (iceState === 'disconnected') {
                console.warn('⚠️ ICE connection disconnected');
            }
        };

        peerConnection.onicegatheringstatechange = () => {
            const gatheringState = peerConnection?.iceGatheringState;
            console.log('🧊 ICE gathering state changed:', gatheringState);
            
            if (gatheringState === 'complete') {
                console.log('✅ ICE gathering completed');
            }
        };

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                console.log('🧊 New ICE candidate generated:', {
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    type: event.candidate.type,
                    protocol: event.candidate.protocol
                });
                
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'ice_candidate',
                        candidate: event.candidate
                    }));
                    console.log('📤 ICE candidate sent via WebSocket');
                } else {
                    console.error('❌ WebSocket not ready when sending ICE candidate');
                }
            } else {
                console.log('🏁 ICE gathering completed (null candidate received)');
            }
        };

        peerConnection.onsignalingstatechange = () => {
            const signalingState = peerConnection?.signalingState;
            console.log('📡 Signaling state changed:', signalingState);
            
            if (signalingState === 'stable') {
                console.log('✅ Signaling negotiation completed successfully');
            } else if (signalingState === 'closed') {
                console.log('🔒 Peer connection signaling closed');
            }
        };

        peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            console.log('📥 Data channel received from remote peer:', {
                label: event.channel.label,
                readyState: event.channel.readyState,
                ordered: event.channel.ordered,
                protocol: event.channel.protocol
            });
            dataChannel = event.channel;
            setupDataChannel(dataChannel);
        };

        if (shouldCreateOffer) {
            console.log('👑 Creating data channel and offer (as creator)...');
            dataChannel = peerConnection.createDataChannel('fileTransfer', { 
                ordered: true,
                maxRetransmits: 3
            });
            console.log('📡 Data channel created:', {
                label: dataChannel.label,
                readyState: dataChannel.readyState,
                ordered: dataChannel.ordered
            });
            setupDataChannel(dataChannel);
            
            try {
                console.log('⏳ Creating WebRTC offer...');
                const offer = await peerConnection.createOffer();
                console.log('📝 Offer created, setting as local description...');
                await peerConnection.setLocalDescription(offer);
                console.log('✅ Local description set successfully');
                console.log('Offer details:', {
                    type: offer.type,
                    sdpPreview: offer.sdp?.substring(0, 200) + '...'
                });
                
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'offer', offer: offer }));
                    console.log('📤 Offer sent via WebSocket');
                } else {
                    console.error('❌ WebSocket not ready when sending offer');
                }
                
                // Enhanced timeout for connection establishment
                setTimeout(() => {
                    if (dataChannel && dataChannel.readyState !== 'open') {
                        console.warn('⚠️ Data channel still not open after 30 seconds');
                        console.log('Current connection states:', {
                            dataChannelState: dataChannel.readyState,
                            peerConnectionState: peerConnection?.connectionState,
                            iceConnectionState: peerConnection?.iceConnectionState,
                            iceGatheringState: peerConnection?.iceGatheringState,
                            signalingState: peerConnection?.signalingState
                        });
                        
                        // Auto-restart if stuck
                        console.log('🔄 Auto-restarting WebRTC connection due to timeout...');
                        setupWebRTC(true);
                    }
                }, 30000);
                
            } catch (error) {
                console.error('❌ Error creating offer:', error);
            }
        } else {
            console.log('👥 Waiting for data channel from remote peer (as joiner)...');
        }
    }function setupDataChannel(channel: RTCDataChannel): void {
        console.log('Setting up data channel:', { 
            readyState: channel.readyState, 
            label: channel.label,
            ordered: channel.ordered,
            protocol: channel.protocol
        });

        channel.onopen = () => {
            console.log('🎉 Data channel opened successfully!');
            console.log('Data channel final state:', {
                readyState: channel.readyState,
                bufferedAmount: channel.bufferedAmount,
                maxPacketLifeTime: channel.maxPacketLifeTime,
                maxRetransmits: channel.maxRetransmits
            });
            peerConnected = true;
            console.log('✅ peerConnected set to true, UI should update');
            
            // Force reactive update
            peerConnected = peerConnected;
        };

        channel.onclose = () => {
            console.log('❌ Data channel closed');
            console.log('Data channel close state:', {
                readyState: channel.readyState,
                peerConnectionState: peerConnection?.connectionState
            });
            peerConnected = false;
        };

        channel.onerror = (error) => {
            console.error('❌ Data channel error:', error);
            console.error('Data channel error details:', {
                readyState: channel.readyState,
                error: error,
                peerConnectionState: peerConnection?.connectionState,
                iceConnectionState: peerConnection?.iceConnectionState
            });
        };

        channel.onmessage = async (event) => {
            try {
                console.log('📩 Received data channel message, size:', event.data.byteLength || event.data.length);
                const encryptedData = event.data;
                const decryptedMessage = await decryptData(encryptedData);
                const message = JSON.parse(decryptedMessage);
                
                console.log('📩 Decrypted message type:', message.type);
                  if (message.type === 'text') {
                    receivedText = message.data;
                    console.log('📝 Text content received');
                } else if (message.type === 'file_info') {
                    currentReceivingFile = {
                        name: message.name,
                        size: message.size,
                        type: message.mimeType,
                        chunks: [],
                        receivedSize: 0
                    };
                    receivingFiles = true;
                    console.log('📁 File transfer started:', message.name);
                } else if (message.type === 'file_chunk' && currentReceivingFile) {
                    const chunkData = new Uint8Array(message.data);
                    currentReceivingFile.chunks.push(chunkData);
                    currentReceivingFile.receivedSize += chunkData.length;
                    transferProgress = (currentReceivingFile.receivedSize / currentReceivingFile.size) * 100;
                    
                    console.log(`📦 File chunk received: ${Math.round(transferProgress)}%`);
                    
                    if (currentReceivingFile.receivedSize >= currentReceivingFile.size) {
                        const completeFile = new Blob(currentReceivingFile.chunks, { type: currentReceivingFile.type });
                        receivedFiles = [...receivedFiles, {
                            name: currentReceivingFile.name,
                            size: currentReceivingFile.size,
                            type: currentReceivingFile.type,
                            blob: completeFile
                        }];
                        
                        console.log('✅ File transfer completed:', currentReceivingFile.name);
                        currentReceivingFile = null;
                        receivingFiles = false;
                        transferProgress = 0;
                    }
                }
            } catch (error) {
                console.error('❌ Error handling data channel message:', error);
            }
        };

        // If the channel is already open, set the state immediately
        if (channel.readyState === 'open') {
            console.log('✅ Data channel was already open, setting peerConnected to true');
            peerConnected = true;
        } else {
            console.log('⏳ Data channel not yet open, current state:', channel.readyState);
        }
    }    async function handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        if (!peerConnection) {
            console.error('❌ No peer connection when handling offer');
            return;
        }
        
        try {
            console.log('📥 Received offer, setting as remote description...');
            console.log('Offer SDP preview:', offer.sdp?.substring(0, 200) + '...');
            
            await peerConnection.setRemoteDescription(offer);
            console.log('✅ Remote description set successfully');
            
            console.log('⏳ Creating answer...');
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log('✅ Answer created and set as local description');
            console.log('Answer SDP preview:', answer.sdp?.substring(0, 200) + '...');
            
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'answer', answer: answer }));
                console.log('📤 Answer sent via WebSocket');
            } else {
                console.error('❌ WebSocket not ready when sending answer');
            }
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }

    async function handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!peerConnection) {
            console.error('❌ No peer connection when handling answer');
            return;
        }
        
        try {
            console.log('📥 Received answer, setting as remote description...');
            console.log('Answer SDP preview:', answer.sdp?.substring(0, 200) + '...');
            
            await peerConnection.setRemoteDescription(answer);
            console.log('✅ Remote description set successfully from answer');
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }

    async function handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!peerConnection) {
            console.error('❌ No peer connection when handling ICE candidate');
            return;
        }
        
        try {
            console.log('🧊 Received ICE candidate:', {
                candidate: candidate.candidate,
                sdpMid: candidate.sdpMid,
                sdpMLineIndex: candidate.sdpMLineIndex
            });
            
            // Wait for remote description to be set before adding ICE candidates
            if (peerConnection.remoteDescription) {
                await peerConnection.addIceCandidate(candidate);
                console.log('✅ ICE candidate added successfully');
            } else {
                console.warn('⚠️ Remote description not set yet, queuing ICE candidate');
                // You might want to queue candidates here, but for simplicity we'll just wait
                setTimeout(async () => {
                    if (peerConnection && peerConnection.remoteDescription) {
                        try {
                            await peerConnection.addIceCandidate(candidate);
                            console.log('✅ Queued ICE candidate added successfully');
                        } catch (error) {
                            console.error('❌ Error adding queued ICE candidate:', error);
                        }
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error handling ICE candidate:', error);
            console.error('ICE candidate details:', candidate);
        }
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

    async function restartWebRTC(): Promise<void> {
        console.log('🔄 Manually restarting WebRTC connection...');
        
        // Close existing connections
        if (dataChannel) {
            console.log('🧹 Closing existing data channel...');
            dataChannel.close();
            dataChannel = null;
        }
        
        if (peerConnection) {
            console.log('🧹 Closing existing peer connection...');
            peerConnection.close();
            peerConnection = null;
        }
        
        // Reset state
        peerConnected = false;
        
        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Restart WebRTC
        if (isCreator) {
            console.log('🔄 Restarting as creator (creating offer)...');
            await setupWebRTC(true);
        } else {
            console.log('⚠️ Only creator can initiate restart. Waiting for creator to restart...');
        }
    }    function cleanup(): void {
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
        clearStoredSession();
    }

    function switchTab(tab: 'files' | 'text'): void {
        activeTab = tab;
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
                    <p>{$t("clipboard.create_description")}</p>
                    <ActionButton
                        id="create-session"
                        click={createSession}
                        disabled={isCreating}
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
                        />
                        <ActionButton
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
        <!-- Session Info -->
        <SettingsCategory title={$t("clipboard.session_active")} sectionId="session-info">
            <div class="session-info">
                <div class="session-details">
                    <div class="session-id">
                        <strong>{$t("clipboard.session_id")}:</strong>
                        <code>{sessionId}</code>
                        <ActionButton 
                            id="share-session"
                            click={shareSession}
                        >
                            📋
                        </ActionButton>
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
            <!-- Navigation Tabs -->
            <div class="tab-navigation">
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'files'}
                    on:click={() => switchTab('files')}
                >
                    📁 文件传输
                </button>
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'text'}
                    on:click={() => switchTab('text')}
                >
                    📝 文本分享
                </button>
            </div>

            <!-- Files Tab -->
            {#if activeTab === 'files'}
                <SettingsCategory title="文件传输" sectionId="file-transfer">
                    <div class="file-transfer-section">
                        <div class="send-files">
                            <h3>发送文件</h3>
                            <div 
                                class="file-drop-zone" 
                                class:dragover
                                on:dragover={handleDragOver}
                                on:dragleave={handleDragLeave}
                                on:drop={handleDrop}
                            >
                                <p>拖放文件到这里或点击选择</p>
                                <input
                                    type="file"
                                    multiple
                                    on:change={handleFileSelect}
                                    style="display: none;"
                                    bind:this={fileInput}
                                />
                                <ActionButton 
                                    id="select-files"
                                    click={() => fileInput?.click()}
                                >
                                    选择文件
                                </ActionButton>
                            </div>

                            {#if files.length > 0}
                                <div class="file-list">
                                    <h4>待发送文件：</h4>
                                    {#each files as file, index}
                                        <div class="file-item">
                                            <span class="file-name">{file.name}</span>
                                            <span class="file-size">({formatFileSize(file.size)})</span>
                                            <button 
                                                type="button" 
                                                on:click={() => removeFile(index)}
                                                class="remove-file"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    {/each}
                                    <ActionButton 
                                        id="send-files"
                                        click={sendFiles}
                                        disabled={sendingFiles}
                                    >
                                        {sendingFiles ? '发送中...' : '发送文件'}
                                    </ActionButton>
                                </div>
                            {/if}

                            {#if sendingFiles}
                                <div class="progress-section">
                                    <h4>发送进度：</h4>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: {transferProgress}%"></div>
                                    </div>
                                    <span class="progress-text">{Math.round(transferProgress)}%</span>
                                </div>
                            {/if}
                        </div>

                        <div class="received-files">
                            <h3>接收到的文件</h3>
                            {#if receivedFiles.length > 0}
                                <div class="file-list">
                                    {#each receivedFiles as file, index}
                                        <div class="file-item">
                                            <span class="file-name">{file.name}</span>
                                            <span class="file-size">({formatFileSize(file.size)})</span>
                                            <ActionButton 
                                                id="download-{index}"
                                                click={() => downloadReceivedFile(file)}
                                            >
                                                下载
                                            </ActionButton>
                                            <button 
                                                type="button" 
                                                on:click={() => removeReceivedFile(index)}
                                                class="remove-file"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="empty-state">还没有接收到任何文件</p>
                            {/if}

                            {#if receivingFiles && currentReceivingFile}
                                <div class="progress-section">
                                    <h4>接收文件：{currentReceivingFile.name}</h4>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: {transferProgress}%"></div>
                                    </div>
                                    <span class="progress-text">{Math.round(transferProgress)}% ({formatFileSize(currentReceivingFile.receivedSize)} / {formatFileSize(currentReceivingFile.size)})</span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </SettingsCategory>
            {/if}

            <!-- Text Tab -->
            {#if activeTab === 'text'}
                <SettingsCategory title="文本分享" sectionId="text-sharing">
                    <div class="text-sharing-section">
                        <div class="send-text">
                            <h3>发送文本</h3>
                            <textarea
                                bind:value={textContent}
                                placeholder="输入要分享的文本内容..."
                                rows="6"
                                class="text-input"
                            ></textarea>
                            <ActionButton 
                                id="send-text"
                                click={sendText}
                                disabled={!textContent.trim()}
                            >
                                发送文本
                            </ActionButton>
                        </div>                        <div class="received-text">
                            <h3>接收到的文本</h3>
                            {#if receivedText}
                                <div class="text-display">
                                    <pre class="text-content">{receivedText}</pre>
                                    <ActionButton 
                                        id="copy-text"
                                        click={() => navigator.clipboard.writeText(receivedText)}
                                    >
                                        复制文本
                                    </ActionButton>
                                </div>
                            {:else}
                                <p class="empty-state">还没有接收到任何文本</p>
                            {/if}
                        </div>
                    </div>                </SettingsCategory>
            {/if}
        {/if}

        <!-- Debug Panel -->
        <SettingsCategory title="Debug Panel" sectionId="debug-panel">
            <div class="debug-panel">
                        <details>
                            <summary>🔧 Connection Debug</summary>
                            <div class="debug-info">
                                <p><strong>WebSocket:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
                                <p><strong>Session ID:</strong> {sessionId || 'Not set'}</p>
                                <p><strong>Is Creator:</strong> {isCreator ? 'Yes' : 'No'}</p>
                                <p><strong>Peer Connected:</strong> {peerConnected ? '✅ Yes' : '❌ No'}</p>
                                <p><strong>Data Channel:</strong> {dataChannel ? (dataChannel.readyState || 'Unknown') : 'Not created'}</p>                                <p><strong>Peer Connection:</strong> {peerConnection ? (peerConnection.connectionState || 'Unknown') : 'Not created'}</p>
                                <p><strong>Signaling State:</strong> {peerConnection ? (peerConnection.signalingState || 'Unknown') : 'Not created'}</p>
                                <p><strong>ICE Connection:</strong> {peerConnection ? (peerConnection.iceConnectionState || 'Unknown') : 'Not created'}</p>
                                <p><strong>ICE Gathering:</strong> {peerConnection ? (peerConnection.iceGatheringState || 'Unknown') : 'Not created'}</p>
                                
                                <div class="debug-actions">
                                    <button 
                                        type="button" 
                                        on:click={() => console.log('🔍 Full Debug State:', { 
                                            isConnected, sessionId, isCreator, peerConnected, 
                                            dataChannelState: dataChannel?.readyState,
                                            peerConnectionState: peerConnection?.connectionState,
                                            iceConnectionState: peerConnection?.iceConnectionState,
                                            iceGatheringState: peerConnection?.iceGatheringState,
                                            hasSharedKey: !!sharedKey,
                                            hasRemotePublicKey: !!remotePublicKey,
                                            wsReadyState: ws?.readyState
                                        })}
                                        class="debug-btn"
                                    >
                                        📝 Log Full State
                                    </button>
                                    
                                    {#if dataChannel && dataChannel.readyState === 'open' && !peerConnected}
                                        <button 
                                            type="button" 
                                            on:click={() => { 
                                                console.log('🔧 Forcing peerConnected to true'); 
                                                peerConnected = true; 
                                            }}
                                            class="debug-btn"
                                        >
                                            🔧 Force Connect
                                        </button>
                                    {/if}
                                      {#if peerConnection && dataChannel && dataChannel.readyState === 'connecting'}
                                        <button 
                                            type="button" 
                                            on:click={restartWebRTC}
                                            class="debug-btn restart-btn"
                                        >
                                            🔄 Restart WebRTC
                                        </button>
                                    {/if}
                                    
                                    <button 
                                        type="button" 
                                        on:click={() => {
                                            console.log('🧪 Testing data channel send...');
                                            if (dataChannel && dataChannel.readyState === 'open') {
                                                try {
                                                    dataChannel.send('test-ping');
                                                    console.log('✅ Test message sent successfully');
                                                } catch (error) {
                                                    console.error('❌ Test send failed:', error);
                                                }
                                            } else {
                                                console.warn('⚠️ Data channel not ready for testing');
                                            }
                                        }}
                                        class="debug-btn"
                                    >
                                        🧪 Test Send
                                    </button>
                                </div>
                                
                                {#if dataChannel && dataChannel.readyState === 'connecting'}
                                    <div class="debug-warning">
                                        ⚠️ Data channel stuck in "connecting" state. This usually indicates:
                                        <ul>
                                            <li>ICE connection issues</li>
                                            <li>Firewall blocking WebRTC</li>
                                            <li>NAT traversal problems</li>
                                        </ul>
                                        Try the "Restart WebRTC" button above.
                                    </div>                                {/if}
                            </div>
                        </details>
                    </div>
        </SettingsCategory>

        <!-- Disconnect Section -->
        <div class="disconnect-section">
            <ActionButton id="cleanup" click={cleanup}>
                {$t("clipboard.disconnect")}
            </ActionButton>
        </div>
    {/if}
</div>

<style>
    /* Tab Navigation Styles */
    .tab-navigation {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        padding: 0.25rem;
        background-color: var(--button);
        border-radius: 0.5rem;
        max-width: fit-content;
        margin: 0 auto 1.5rem auto;
    }

    .tab-button {
        padding: 0.75rem 1.5rem;
        border: none;
        background-color: transparent;
        color: var(--secondary);
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tab-button:hover {
        background-color: var(--button-hover);
        color: var(--text);
    }

    .tab-button.active {
        background-color: var(--secondary);
        color: var(--primary);
        cursor: default;
    }

    .tab-button.active:hover {
        background-color: var(--secondary);
        color: var(--primary);
    }

    /* File Transfer Section Styles */
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

    /* Text Sharing Section Styles */
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
    }

    .text-input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-background);
    }

    .text-display {
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        padding: 1rem;
        background-color: var(--background-alt);
    }

    .text-content {
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0 0 1rem 0;
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--text);
    }

    /* Progress and File Item Styles */
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

    /* Empty State Styles */
    .empty-state {
        text-align: center;
        color: var(--secondary);
        font-style: italic;
        padding: 2rem;
        border: 1px dashed var(--border);
        border-radius: 0.5rem;
        background-color: var(--background-alt);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .tab-navigation {
            width: 100%;
            max-width: none;
        }
        
        .tab-button {
            flex: 1;
            justify-content: center;
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
        }
        
        .file-transfer-section,
        .text-sharing-section {
            gap: 1.5rem;
        }
          .file-drop-zone {
            padding: 1.5rem 1rem;
        }
    }

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

    .debug-panel {
        margin-top: 1rem;
        border: 1px solid var(--border);
        border-radius: 0.25rem;
        overflow: hidden;
    }

    .debug-panel summary {
        padding: 0.5rem;
        background-color: var(--background-alt);
        cursor: pointer;
        font-size: 0.85rem;
        border-bottom: 1px solid var(--border);
    }

    .debug-panel summary:hover {
        background-color: var(--hover-background);
    }

    .debug-info {
        padding: 0.75rem;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    .debug-info p {
        margin: 0.25rem 0;
        font-family: monospace;
    }

    .debug-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .debug-btn {
        padding: 0.25rem 0.5rem;
        background-color: var(--accent-background);
        border: 1px solid var(--accent);
        border-radius: 0.25rem;
        color: var(--accent);
        cursor: pointer;
        font-size: 0.75rem;
        transition: all 0.2s ease;
    }    .debug-btn:hover {
        background-color: var(--accent);
        color: var(--background);
    }

    .restart-btn {
        background-color: var(--orange-background);
        border-color: var(--orange);
        color: var(--orange);
    }

    .restart-btn:hover {
        background-color: var(--orange);
        color: var(--background);
    }

    .debug-warning {
        margin-top: 0.75rem;
        padding: 0.5rem;
        background-color: var(--yellow-background);
        border: 1px solid var(--yellow);
        border-radius: 0.25rem;
        font-size: 0.75rem;
        color: var(--text);
    }

    .debug-warning ul {
        margin: 0.25rem 0 0 1rem;
        padding: 0;
    }    .debug-warning li {
        margin: 0.1rem 0;
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
