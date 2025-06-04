<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    
    const dispatch = createEventDispatcher();
    
    export let isConnected: boolean;
    export let sessionId: string;
    export let isCreator: boolean;
    export let peerConnected: boolean;
    export let dataChannel: RTCDataChannel | null;
    export let peerConnection: RTCPeerConnection | null;
    
    function restartWebRTC(): void {
        dispatch('restartWebRTC');
    }
    
    function forceConnection(): void {
        dispatch('forceConnection');
    }
</script>

<SettingsCategory title="Debug Panel" sectionId="debug-panel">
    <div class="debug-panel">
        <details>
            <summary>🔧 Connection Debug</summary>
            <div class="debug-info">
                <p><strong>WebSocket:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
                <p><strong>Session ID:</strong> {sessionId || 'Not set'}</p>
                <p><strong>Is Creator:</strong> {isCreator ? 'Yes' : 'No'}</p>
                <p><strong>Peer Connected:</strong> {peerConnected ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Data Channel:</strong> {dataChannel ? (dataChannel.readyState || 'Unknown') : 'Not created'}</p>
                <p><strong>Peer Connection:</strong> {peerConnection ? (peerConnection.connectionState || 'Unknown') : 'Not created'}</p>
                <p><strong>Signaling State:</strong> {peerConnection ? (peerConnection.signalingState || 'Unknown') : 'Not created'}</p>
                <p><strong>ICE Connection:</strong> {peerConnection ? (peerConnection.iceConnectionState || 'Unknown') : 'Not created'}</p>
                <p><strong>ICE Gathering:</strong> {peerConnection ? (peerConnection.iceGatheringState || 'Unknown') : 'Not created'}</p>
                
                <div class="debug-actions">
                    <button 
                        class="debug-btn restart-btn"
                        on:click={restartWebRTC}
                        disabled={!isCreator}
                    >
                        🔄 Restart WebRTC
                    </button>
                    
                    {#if dataChannel && dataChannel.readyState === 'open' && !peerConnected}
                        <button 
                            class="debug-btn"
                            on:click={forceConnection}
                        >
                            🔗 Force Connection
                        </button>
                    {/if}
                </div>
                
                {#if dataChannel && dataChannel.readyState === 'connecting'}
                    <div class="debug-warning">
                        <strong>⚠️ Data channel stuck in 'connecting' state</strong>
                        <ul>
                            <li>This usually indicates network connectivity issues</li>
                            <li>Check firewall settings and network restrictions</li>
                            <li>Try restarting the WebRTC connection</li>
                        </ul>
                    </div>
                {/if}
            </div>
        </details>
    </div>
</SettingsCategory>

<style>
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
    }

    .debug-btn:hover:not(:disabled) {
        background-color: var(--accent);
        color: var(--background);
    }

    .debug-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .restart-btn {
        background-color: var(--orange-background);
        border-color: var(--orange);
        color: var(--orange);
    }

    .restart-btn:hover:not(:disabled) {
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
    }

    .debug-warning li {
        margin: 0.1rem 0;
    }
</style>
