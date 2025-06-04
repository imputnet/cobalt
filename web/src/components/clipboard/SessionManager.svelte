<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { t } from '$lib/i18n/translations';
    import SettingsCategory from '$components/settings/SettingsCategory.svelte';
    import ActionButton from '$components/buttons/ActionButton.svelte';
    
    const dispatch = createEventDispatcher();
    
    export let isConnected: boolean;
    export let isCreating: boolean;
    export let isJoining: boolean;
    export let joinCode: string;
    export let sessionId: string;
    export let isCreator: boolean;
    export let peerConnected: boolean;
    export let qrCodeUrl: string;
    
    function handleCreateSession() {
        dispatch('createSession');
    }
    
    function handleJoinSession() {
        dispatch('joinSession');
    }
    
    function handleShare() {
        dispatch('shareSession');
    }
    
    function handleCleanup() {
        dispatch('cleanup');
    }
</script>

{#if !isConnected}
    <SettingsCategory title={$t("clipboard.title")} sectionId="connection-setup">
        <div class="connection-setup">
            <div class="setup-option">
                <h3>{$t("clipboard.create_session")}</h3>
                <p>{$t("clipboard.create_description")}</p>                <ActionButton
                    id="create-session"
                    disabled={isCreating}
                    click={handleCreateSession}
                >
                    {isCreating ? 'Creating...' : $t("clipboard.create_session")}
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
                        placeholder="Enter session code"
                        disabled={isJoining}
                    />                    <ActionButton
                        id="join-session"
                        disabled={isJoining || !joinCode.trim()}
                        click={handleJoinSession}
                    >
                        {isJoining ? 'Joining...' : $t("clipboard.join_session")}
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
                    <span>Session ID:</span>
                    <code>{sessionId}</code>
                    <button class="copy-btn" on:click={handleShare}>📋</button>
                </div>
                
                {#if isCreator && sessionId && !peerConnected && qrCodeUrl}
                    <div class="qr-code">
                        <h4>Scan to join:</h4>
                        <img src={qrCodeUrl} alt="QR Code" />
                    </div>
                {/if}
                
                <div class="connection-status">
                    <div class="status-indicator" class:connected={peerConnected}></div>
                    <span>{peerConnected ? 'Connected' : 'Waiting for peer...'}</span>
                </div>
            </div>
        </div>
    </SettingsCategory>
    
    <!-- Disconnect Section -->
    <div class="disconnect-section">
        <ActionButton id="cleanup" click={handleCleanup}>
            {$t("clipboard.disconnect")}
        </ActionButton>
    </div>
{/if}

<style>    .connection-setup {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        padding: 1rem;
    }

    .setup-option {
        text-align: center;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
    }

    .setup-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(255, 255, 255, 0.15);
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
    }    .session-info {
        text-align: center;
        padding: 1rem;
    }

    .session-details {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .session-id {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(4px);
    }

    .session-id span {
        font-weight: 500;
        color: var(--secondary);
    }

    .session-id code {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-weight: 600;
        letter-spacing: 0.5px;
        color: #667eea;
        border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .copy-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
        font-size: 1rem;
    }

    .copy-btn:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .qr-code {
        text-align: center;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(4px);
    }

    .qr-code h4 {
        margin: 0 0 1rem 0;
        font-weight: 600;
        color: var(--text);
    }

    .qr-code img {
        max-width: 200px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .connection-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(4px);
    }

    .status-indicator {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #f44336;
        position: relative;
        transition: all 0.3s ease;
    }

    .status-indicator::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        background-color: inherit;
        opacity: 0.3;
        animation: pulse 2s infinite;
    }

    .status-indicator.connected {
        background-color: #4caf50;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.3;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.1;
        }
        100% {
            transform: scale(1);
            opacity: 0.3;
        }
    }

    .connection-status span {
        font-weight: 500;
        color: var(--text);
    }

    .disconnect-section {
        text-align: center;
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
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
