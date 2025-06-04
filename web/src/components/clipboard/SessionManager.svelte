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

<style>
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

    .copy-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
    }

    .copy-btn:hover {
        background-color: var(--hover-background);
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
