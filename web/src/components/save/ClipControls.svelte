<script lang="ts">
    import ClipRangeSlider from "./ClipRangeSlider.svelte";

    let {
        metaLoading,
        metaError,
        metadata,
        clipStart = $bindable(),
        clipEnd = $bindable()
    } = $props<{
        metaLoading: boolean;
        metaError: string | null;
        metadata: { title?: string; author?: string; duration?: number } | null;
        clipStart: number;
        clipEnd: number;
    }>();

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3).padStart(6, '0');
        return `${m}:${s}`;
    }
</script>

<div class="clip-controls">
    {#if metaLoading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading video metadata...</span>
        </div>
    {:else if metaError}
        <div class="error-state">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>{metaError}</span>
        </div>
    {:else if metadata}
        <div class="clip-metadata">
            <div class="metadata-header">
                <h4>Clip</h4>
                <div class="duration-badge">
                    {typeof metadata.duration === 'number' ? formatTime(metadata.duration) : 'Unknown'}
                </div>
            </div>
            <div class="video-info">
                <div class="video-title" title={metadata.title}>
                    {metadata.title}
                </div>
                {#if metadata.author}
                    <div class="video-author">
                        by {metadata.author}
                    </div>
                {/if}
            </div>
        </div>
        
        <ClipRangeSlider
            min={0}
            max={metadata.duration || 0}
            step={0.001}
            bind:start={clipStart}
            bind:end={clipEnd}
        />
        
        <div class="clip-time-display">
            <div class="time-indicators">
                <span class="start-time">{formatTime(clipStart)}</span>
                <span class="duration-selected">
                    {formatTime(Math.max(0, clipEnd - clipStart))} selected
                </span>
                <span class="end-time">{formatTime(clipEnd)}</span>
            </div>
        </div>
    {/if}
</div>

<style>
    .clip-controls {
        margin-top: 12px;
        padding: 16px;
        background: var(--button);
        border-radius: var(--border-radius);
        border: 1px solid var(--button-stroke);
        animation: slideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
    }

    .loading-state {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        color: var(--gray);
        font-size: 14px;
    }

    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--button-hover);
        border-top: 2px solid var(--secondary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .error-state {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: rgba(237, 34, 54, 0.1);
        border: 1px solid rgba(237, 34, 54, 0.2);
        border-radius: 8px;
        color: var(--red);
        font-size: 13px;
        font-weight: 500;
    }

    .clip-metadata {
        margin-bottom: 16px;
    }

    .metadata-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
    }

    .metadata-header h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--secondary);
    }

    .duration-badge {
        background: var(--button-elevated);
        color: var(--button-text);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        font-family: 'IBM Plex Mono', monospace;
    }

    .video-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .video-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
    }

    .video-author {
        font-size: 12px;
        color: var(--gray);
        font-weight: 400;
    }

    .clip-time-display {
        margin-top: 8px;
    }

    .time-indicators {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 500;
        font-family: 'IBM Plex Mono', monospace;
    }

    .start-time, .end-time {
        color: var(--gray);
        background: var(--button-hover);
        padding: 2px 6px;
        border-radius: 4px;
        min-width: 50px;
        text-align: center;
    }

    .duration-selected {
        grid-area: duration;
        text-align: center;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media screen and (max-width: 440px) {
        .clip-controls {
            padding: 12px;
        }

        .metadata-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .video-title {
            white-space: normal;
        }

        .time-indicators {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                "start end"
                "duration duration";
            gap: 8px;
        }

        .start-time {
            grid-area: start;
        }

        .end-time {
            grid-area: end;
        }
    }
</style>
