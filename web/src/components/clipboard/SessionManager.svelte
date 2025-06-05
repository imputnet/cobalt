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
    <SettingsCategory title="" sectionId="connection-setup">
        <div class="connection-setup">
            <div class="setup-option">
                <h3>{$t("clipboard.create_session")}</h3>
                <p>{$t("clipboard.create_description")}</p>                <ActionButton
                    id="create-session"
                    disabled={isCreating}
                    click={handleCreateSession}
                >
                    {isCreating ? $t("clipboard.creating") : $t("clipboard.create_session")}
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
                        disabled={isJoining || !joinCode.trim()}
                        click={handleJoinSession}
                    >
                        {isJoining ? $t("clipboard.joining") : $t("clipboard.join_session")}
                    </ActionButton>
                </div>
            </div>
        </div>
    </SettingsCategory>
{:else}
    <!-- Session Info -->
    <SettingsCategory title={$t("clipboard.session_active")} sectionId="session-info">
        <div class="session-info">
            <div class="session-details">                <div class="session-id">
                    <span>{$t("clipboard.session_id")}:</span>
                    <code>{sessionId}</code>
                    <button class="copy-btn" on:click={handleShare}>📋</button>
                </div>
                
                {#if isCreator && sessionId && !peerConnected && qrCodeUrl}                    <div class="qr-code">
                        <h4>{$t("clipboard.scan_qr")}</h4>
                        <img src={qrCodeUrl} alt="QR Code" />
                    </div>
                {/if}
                  <div class="connection-status">
                    <div class="status-indicator" class:connected={peerConnected}></div>
                    <span>{peerConnected ? $t("clipboard.peer_connected") : $t("clipboard.waiting_peer")}</span>
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
        gap: 1rem;
        padding: 0.5rem;
        max-width: 800px;
        margin: 0 auto;
    }    .setup-option {
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .setup-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        transition: left 0.5s;
    }

    .setup-option:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border-color: rgba(102, 126, 234, 0.3);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    .setup-option:hover::before {
        left: 100%;
    }    .setup-option h3 {
        margin-bottom: 0.5rem;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .setup-option p {
        margin-bottom: 1rem;
        color: var(--secondary);
        line-height: 1.6;
        font-size: 0.9rem;
    }    .divider {
        text-align: center;
        position: relative;
        margin: 0.75rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
        border-radius: 1px;
    }

    .divider span {
        background: linear-gradient(135deg, var(--background), rgba(255, 255, 255, 0.02));
        padding: 0.75rem 1.5rem;
        color: var(--secondary);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        font-weight: 500;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        z-index: 1;
        position: relative;
    }    .join-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 400px;
        margin: 0 auto;
        align-items: center;
        width: 100%;
    }    .join-form input {
        padding: 1rem 1.25rem;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
        color: var(--text);
        font-size: 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(8px);
        width: 100%;
        min-height: 48px;
        box-sizing: border-box;
    }

    .join-form input:focus {
        outline: none;
        border-color: rgba(102, 126, 234, 0.5);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }

    .join-form input::placeholder {
        color: var(--secondary);
        opacity: 0.7;
    }

    /* Ensure ActionButton is properly sized on mobile */
    .join-form :global(.action-button) {
        width: 100%;
        min-height: 48px;
        font-size: 1rem;
        font-weight: 600;    }    .session-info {
        text-align: center;
        padding: 0.75rem;
        max-width: 900px;
        margin: 0 auto;
    }    .session-details {
        display: grid;
        gap: 0.75rem;
        align-items: center;
        justify-items: center;
        grid-template-columns: 1fr;
        max-width: 800px;
        margin: 0 auto;
    }.session-id {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        width: 100%;
        max-width: 400px;
        transition: all 0.3s ease;
    }

    .session-id:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: rgba(102, 126, 234, 0.3);
    }

    .session-id span {
        font-weight: 600;
        color: var(--secondary);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .session-id code {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
        padding: 0.75rem 1.25rem;
        border-radius: 10px;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-weight: 700;
        letter-spacing: 1px;
        color: #667eea;
        border: 1px solid rgba(102, 126, 234, 0.3);
        font-size: 1.1rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        flex: 1;
        text-align: center;
    }    .copy-btn {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border: 1px solid rgba(102, 126, 234, 0.2);
        cursor: pointer;
        padding: 0.75rem;
        border-radius: 10px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        height: 44px;
    }

    .copy-btn:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border-color: rgba(102, 126, 234, 0.4);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .copy-btn:active {
        transform: translateY(0) scale(0.95);
    }    .qr-code {
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        max-width: 280px;
        width: 100%;
        margin: 0 auto;
        justify-self: center;
        align-self: center;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }.qr-code:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        border-color: rgba(102, 126, 234, 0.3);
    }    .qr-code h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: var(--text);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .qr-code img {
        max-width: 180px;
        width: 100%;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    }

    .qr-code img:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    }    .connection-status {
        display: flex;
        align-items: center;        gap: 1rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        max-width: 300px;
        width: 100%;
        justify-content: center;
    }

    .connection-status:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .status-indicator {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #f44336;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }

    .status-indicator::before {
        content: '';
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border-radius: 50%;
        background-color: inherit;
        opacity: 0.2;
        animation: pulse 2s infinite;
    }

    .status-indicator.connected {
        background-color: #4caf50;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.2;
        }
        50% {
            transform: scale(1.3);
            opacity: 0.05;
        }
        100% {
            transform: scale(1);
            opacity: 0.2;
        }
    }

    .connection-status span {
        font-weight: 600;
        color: var(--text);
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }    .disconnect-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 2px solid rgba(255, 255, 255, 0.05);
        position: relative;
        width: 100%;
    }

    .disconnect-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(244, 67, 54, 0.5), transparent);
        border-radius: 1px;
    }    @media (min-width: 768px) {
        .connection-setup {
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            max-width: 600px;
        }        .setup-option {
            width: 100%;
            max-width: 500px;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .divider {
            align-self: center;
            margin: 1.5rem 0;
            width: 100%;
            flex-shrink: 0;
        }

        .divider::before {
            top: 50%;
            left: 0;
            right: 0;
            width: auto;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
        }

        .divider span {
            transform: none;
            white-space: nowrap;
        }        .session-details {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            align-items: center;
            justify-items: center;
        }

        .session-id {
            justify-self: center;
        }

        .qr-code {
            justify-self: center;
        }

        .connection-status {
            justify-self: center;
        }
    }    @media (min-width: 1024px) {
        .connection-setup {
            gap: 2rem;
        }

        .setup-option {
            padding: 2rem;
        }

        .session-details {
            gap: 2.5rem;
        }
    }    /* Enhanced mobile styles */
    @media (max-width: 639px) {
        .connection-setup {
            padding: 0.5rem;
            gap: 0.75rem;
        }

        .setup-option {
            padding: 0.75rem;
        }

        .setup-option h3 {
            font-size: 1.15rem;
            margin-bottom: 0.25rem;
        }

        .setup-option p {
            margin-bottom: 0.75rem;
            font-size: 0.85rem;
        }

        .divider {
            margin: 0.5rem 0;
        }

        .session-info {
            padding: 0.75rem;
        }        .session-details {
            gap: 0.75rem;
        }

        .session-id {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
            max-width: 100%;
        }

        .session-id code {
            font-size: 0.95rem;
            padding: 0.6rem;
            word-break: break-all;
        }

        .copy-btn {
            align-self: center;
            min-width: 44px;
        }

        .qr-code {
            max-width: 220px;
            padding: 0.75rem;
        }

        .qr-code img {
            max-width: 160px;
        }

        .connection-status {            max-width: 260px;
            padding: 0.75rem;
        }

        .disconnect-section {
            margin-top: 0.4rem;
            padding-top: 0.4rem;
        }
    }
</style>
